"use client";

import { X, Plus, Trash } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import { FileUpload } from "@/app/components/FileUpload";
import Image from "next/image";
import { createRaffle } from "@/app/contexts/raffle/raffle.actions";

const createRaffleSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  imagesUrls: z.array(z.string()).min(1, "A imagem é obrigatória"),
  prices: z.array(z.object({
    quantity: z.number({
      required_error: "A quantidade é obrigatória",
      invalid_type_error: "A quantidade deve ser um número",
    }).min(2, "A quantidade deve ser maior que 1"),
    pricePerUnit: z.number({
      required_error: "O preço é obrigatório",
      invalid_type_error: "O preço deve ser um número",
    }).min(0.01, "O preço deve ser maior que 0"),
  }))
  .min(1, "Adicione pelo menos um preço")
  .refine(
    (prices) => {
      // Verifica se existem quantidades duplicadas
      const quantities = prices.map(p => p.quantity);
      return new Set(quantities).size === quantities.length;
    },
    {
      message: "Não é permitido ter preços com quantidades repetidas",
    }
  )
  .refine(
    (prices) => {
      // Ordena os preços por quantidade
      const sortedPrices = [...prices].sort((a, b) => a.quantity - b.quantity);
      
      // Verifica se os preços por unidade estão em ordem decrescente ou igual
      for (let i = 1; i < sortedPrices.length; i++) {
        if (sortedPrices[i].pricePerUnit > sortedPrices[i - 1].pricePerUnit) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Preços por unidade devem diminuir ou permanecer iguais conforme a quantidade aumenta",
    }
  ),
  awardedNumbers: z.array(z.object({
    reference_number: z.number({
      required_error: "O número premiado é obrigatório",
      invalid_type_error: "O número premiado deve ser um número",
    }).min(1, "O número premiado deve ser maior que 0"),
    award: z.string().min(1, "A descrição do prêmio é obrigatória"),
  }))
  .refine(
    (numbers) => {
      const referenceNumbers = numbers.map(n => n.reference_number);
      return new Set(referenceNumbers).size === referenceNumbers.length;
    },
    {
      message: "Não é permitido ter números premiados repetidos",
    }
  ),
});

export type CreateRaffleFormData = z.infer<typeof createRaffleSchema>;

interface CreateRaffleModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateRaffleModal = ({ open, onClose }: CreateRaffleModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<CreateRaffleFormData>({
    resolver: zodResolver(createRaffleSchema),
    defaultValues: {
      imagesUrls: [],
      prices: [{ quantity: 1, pricePerUnit: 0.07 }, { quantity: 10, pricePerUnit: 0.06 }],
      awardedNumbers: [{ reference_number: 999999, award: "R$1.000,00" }],
    },
  });

  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
    control,
    name: "prices",
  });

  const { 
    fields: awardFields, 
    append: appendAward, 
    remove: removeAward 
  } = useFieldArray({
    control,
    name: "awardedNumbers",
  });

  const imagesUrls = watch("imagesUrls");
  const removeImage = (index: number) => {
    const newImagesUrls = [...imagesUrls];
    newImagesUrls.splice(index, 1);
    setValue("imagesUrls", newImagesUrls);
  };

  const onSubmit = async (data: CreateRaffleFormData) => {
    await createRaffle(data);
    handleClose();
  };

  // Observa todos os preços para mostrar mensagens de erro específicas
  const prices = watch("prices");
  const getPriceError = (index: number): string | undefined => {
    if (!errors.prices?.root) return undefined;

    const quantities = prices.map(p => p.quantity);
    if (new Set(quantities).size !== quantities.length) {
      const currentQuantity = prices[index].quantity;
      const firstIndex = quantities.indexOf(currentQuantity);
      if (firstIndex !== index && currentQuantity === prices[firstIndex].quantity) {
        return `Quantidade ${currentQuantity} já existe`;
      }
    }

    const sortedPrices = [...prices].sort((a, b) => a.quantity - b.quantity);
    for (let i = 1; i < sortedPrices.length; i++) {
      if (sortedPrices[i].pricePerUnit > sortedPrices[i - 1].pricePerUnit) {
        const currentPrice = prices[index];
        if (currentPrice === sortedPrices[i]) {
          return `Preço por unidade deve ser menor ou igual a R$ ${sortedPrices[i - 1].pricePerUnit.toFixed(2)}`;
        }
      }
    }

    return errors.prices.root.message;
  };

  // Função para verificar erros específicos dos números premiados
  const awardedNumbers = watch("awardedNumbers");
  const getAwardError = (index: number): string | undefined => {
    if (!errors.awardedNumbers?.root) return undefined;

    const referenceNumbers = awardedNumbers.map(n => n.reference_number);
    if (new Set(referenceNumbers).size !== referenceNumbers.length) {
      const currentNumber = awardedNumbers[index].reference_number;
      const firstIndex = referenceNumbers.indexOf(currentNumber);
      if (firstIndex !== index && currentNumber === awardedNumbers[firstIndex].reference_number) {
        return `Número premiado ${currentNumber} já existe`;
      }
    }

    return errors.awardedNumbers.root.message;
  };

  if (!open) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="rounded-xl py-4 md:py-6 w-full max-w-2xl text-foreground bg-white">
        <div className="flex flex-row justify-between items-center mb-4 md:mb-8 px-4 md:px-6">
          <h2 className="text-xl font-bold">Criar Sorteio</h2>
          <button
            onClick={handleClose}
            className="text-foreground cursor-pointer hover:text-foreground/80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto max-h-[80vh] pb-2 px-4 md:px-6">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              {...register("title")}
              className="w-full p-2 border rounded-md"
              placeholder="Digite o título do sorteio"
            />
            {errors.title && (
              <span className="text-red-500 text-xs">{errors.title.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              {...register("description")}
              className="w-full p-2 border rounded-md h-24"
              placeholder="Digite a descrição do sorteio"
            />
            {errors.description && (
              <span className="text-red-500 text-xs">{errors.description.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Imagens</label>
            <FileUpload path="/raffles" onUploadComplete={(url) => {
              setValue("imagesUrls", [...imagesUrls, url]);
            }} />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-4">
            {imagesUrls.map((url, index) => (
              <div key={index} className="flex flex-col mb-4 border border-red-500 rounded-md p-1">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="-mb-6 z-2 cursor-pointer p-2 text-red-500 hover:text-red-700 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash className="w-5 h-5" />
                </button>
                <Image src={url} alt="Imagem do sorteio" width={1920} height={1080} className="w-full h-auto" />
              </div>
            ))}
            {errors.imagesUrls && (
                    <span className="text-red-500 text-xs">
                      {errors.imagesUrls?.message}
                    </span>
                  )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preços</label>
            <div className="text-[11px] md:text-xs text-gray-500 mb-0 md:mb-4">
              <p>• Não é permitido ter preços com quantidades repetidas</p>
              <p>• O preço por unidade deve diminuir ou permanecer igual conforme a quantidade aumenta</p>
            </div>
            {priceFields.map((field, index) => (
              <div key={field.id} className="flex flex-col mb-4">
              <div className="flex md:flex-row flex-col gap-4">
                <button
                  type="button"
                  disabled={priceFields.length === 2}
                  onClick={() => removePrice(index)}
                  className="md:hidden -mb-10 cursor-pointer p-2 text-red-500 hover:text-red-700 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    {...register(`prices.${index}.quantity` as const, {
                      valueAsNumber: true,
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="Ex: 10"
                  />
                  {errors.prices?.[index]?.quantity && (
                    <span className="text-red-500 text-xs">
                      {errors.prices[index]?.quantity?.message}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Preço por unidade
                  </label>
                  <Controller
                    name={`prices.${index}.pricePerUnit`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <NumericFormat
                        value={value}
                        onValueChange={(values) => {
                          onChange(values.floatValue);
                        }}
                        decimalScale={2}
                        fixedDecimalScale
                        prefix="R$ "
                        decimalSeparator=","
                        thousandSeparator="."
                        className="w-full p-2 border rounded-md"
                        placeholder="Ex: R$ 10,00"
                      />
                    )}
                  />
                  {errors.prices?.[index]?.pricePerUnit && (
                    <span className="text-red-500 text-xs">
                      {errors.prices[index]?.pricePerUnit?.message}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={priceFields.length === 2}
                  onClick={() => removePrice(index)}
                  className="hidden md:block cursor-pointer p-2 text-red-500 hover:text-red-700 self-end mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
                {getPriceError(index) && (
                  <span className="text-red-500 text-xs md:col-span-2 mt-1">
                    {getPriceError(index)}
                  </span>
                )}
              </div>
            ))}
            {/* {errors.prices?.root && (
              <span className="text-red-500 text-sm block mt-2">
                {errors.prices.root.message}
              </span>
            )} */}
            <button
              type="button"
              onClick={() => appendPrice({ quantity: 1, pricePerUnit: 0 })}
              className="cursor-pointer flex items-center gap-2 text-sm p-2 border border-red-500 text-red-500 rounded-md hover:bg-red-100"
            >
              <Plus className="w-4 h-4" /> Adicionar preço
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cotas Premiadas</label>
            <div className="text-[11px] md:text-xs text-gray-500 mb-0 md:mb-4">
              <p>• Não é permitido ter números premiados repetidos</p>
            </div>
            {awardFields.map((field, index) => (
              <div key={field.id} className="flex flex-col mb-4">
                <div className="flex md:flex-row flex-col gap-4">
                  <button
                    type="button"
                    disabled={awardFields.length === 1}
                    onClick={() => removeAward(index)}
                    className="md:hidden -mb-10 cursor-pointer p-2 text-red-500 hover:text-red-700 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash className="w-5 h-5 cursor-pointer" />
                  </button>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      Número premiado
                    </label>
                    <input
                      type="number"
                      {...register(`awardedNumbers.${index}.reference_number` as const, {
                        valueAsNumber: true,
                      })}
                      className="w-full p-2 border rounded-md"
                      placeholder="Ex: 42"
                    />
                    {errors.awardedNumbers?.[index]?.reference_number && (
                      <span className="text-red-500 text-xs">
                        {errors.awardedNumbers[index]?.reference_number?.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      Descrição do prêmio
                    </label>
                    <input
                      {...register(`awardedNumbers.${index}.award` as const)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Ex: iPhone 15"
                    />
                    {errors.awardedNumbers?.[index]?.award && (
                      <span className="text-red-500 text-xs">
                        {errors.awardedNumbers[index]?.award?.message}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={awardFields.length === 1}
                    onClick={() => removeAward(index)}
                    className="hidden md:block cursor-pointer p-2 text-red-500 hover:text-red-700 self-end mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash className="w-5 h-5 cursor-pointer" />
                  </button>
                </div>
                {getAwardError(index) && (
                  <span className="text-red-500 text-xs md:col-span-2 mt-1">
                    {getAwardError(index)}
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendAward({ reference_number: 1, award: "" })}
              className="cursor-pointer flex items-center gap-2 text-sm p-2 border border-red-500 text-red-500 rounded-md hover:bg-red-100"
            >
              <Plus className="w-4 h-4" /> Adicionar prêmio
            </button>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Criar Sorteio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRaffleModal;
