"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash, Loader2 } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import { FileUpload } from "@/app/components/FileUpload";
import Image from "next/image";
import {
  updateTopBuyersFlag,
  updateTopBuyerWeekFlag,
  updateTopBuyerDayFlag,
  updateLowestQuotaFlag,
  updateHighestQuotaFlag,
  updateProgressFlag,
  getRaffleFlags,
} from "@/app/contexts/raffle/raffle-flags.actions";
import {
  getRaffleById,
  updateRaffle,
} from "@/app/contexts/raffle/raffle.actions";
import useSWR from "swr";
import { toast } from "sonner";

const editRaffleSchema = z
  .object({
    title: z.string().min(1, "O título é obrigatório"),
    description: z.string().min(1, "A descrição é obrigatória"),
    imagesUrls: z.array(z.string()).min(1, "A imagem é obrigatória"),
    preQuantityNumbers: z
      .array(z.number())
      .min(1, "Adicione pelo menos um número pré-definido")
      .refine(
        (numbers) => {
          return new Set(numbers).size === numbers.length;
        },
        {
          message: "Não é permitido ter números repetidos",
        }
      ),
    minQuantity: z.number().min(1, "A quantidade mínima deve ser maior que 0"),
    maxQuantity: z
      .number()
      .min(1, "A quantidade máxima deve ser maior que 0")
      .max(999999, "A quantidade máxima não pode ultrapassar 999.999"),
    prices: z
      .array(
        z.object({
          id: z.string().optional(),
          quantity: z
            .number({
              required_error: "A quantidade é obrigatória",
              invalid_type_error: "A quantidade deve ser um número",
            })
            .min(1, "A quantidade deve ser maior que 1"),
          pricePerUnit: z
            .number({
              required_error: "O preço é obrigatório",
              invalid_type_error: "O preço deve ser um número",
            })
            .min(0.01, "O preço deve ser maior que 0"),
        })
      )
      .min(2, "Adicione pelo menos dois preços")
      .refine(
        (prices) => {
          // Verifica se existem quantidades duplicadas
          const quantities = prices.map((p) => p.quantity);
          return new Set(quantities).size === quantities.length;
        },
        {
          message: "Não é permitido ter preços com quantidades repetidas",
        }
      )
      .refine(
        (prices) => {
          // Ordena os preços por quantidade
          const sortedPrices = [...prices].sort(
            (a, b) => a.quantity - b.quantity
          );

          // Verifica se os preços por unidade estão em ordem decrescente ou igual
          for (let i = 1; i < sortedPrices.length; i++) {
            if (
              sortedPrices[i].pricePerUnit > sortedPrices[i - 1].pricePerUnit
            ) {
              return false;
            }
          }
          return true;
        },
        {
          message:
            "Preços por unidade devem diminuir ou permanecer iguais conforme a quantidade aumenta",
        }
      ),
    awardedNumbers: z
      .array(
        z.object({
          id: z.string().optional(),
          reference_number: z
            .number({
              required_error: "O número premiado é obrigatório",
              invalid_type_error: "O número premiado deve ser um número",
            })
            .min(1, "O número premiado deve ser maior que 0"),
          award: z.string().min(1, "A descrição do prêmio é obrigatória"),
        })
      )
      .refine(
        (numbers) => {
          const referenceNumbers = numbers.map((n) => n.reference_number);
          return new Set(referenceNumbers).size === referenceNumbers.length;
        },
        {
          message: "Não é permitido ter números premiados repetidos",
        }
      ),
  })
  .refine(
    (data) => {
      return data.maxQuantity >= data.minQuantity;
    },
    {
      message:
        "A quantidade máxima deve ser maior ou igual à quantidade mínima",
      path: ["maxQuantity"],
    }
  );

type EditRaffleFormData = z.infer<typeof editRaffleSchema>;

interface EditRaffleModalProps {
  raffleId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FlagState = {
  flagTopBuyers: boolean;
  flagTopBuyersWeek: boolean;
  flagTopBuyersDay: boolean;
  flagLowestQuota: boolean;
  flagHighestQuota: boolean;
  flagProgress: boolean;
};

const defaultFlags: FlagState = {
  flagTopBuyers: false,
  flagTopBuyersWeek: false,
  flagTopBuyersDay: false,
  flagLowestQuota: false,
  flagHighestQuota: false,
  flagProgress: false,
};

const EditRaffleModal = ({
  raffleId,
  isOpen,
  onClose,
  onSuccess,
}: EditRaffleModalProps) => {
  const { data: flags, mutate: mutateFlags } = useSWR(
    isOpen ? `/api/raffles/${raffleId}/flags` : null,
    () => getRaffleFlags(raffleId)
  );

  const { data: raffle, mutate: mutateRaffle } = useSWR(
    isOpen ? `/api/raffles/${raffleId}` : null,
    () => getRaffleById(raffleId)
  );

  const [flagsState, setFlagsState] = useState<FlagState>(defaultFlags);
  const [loadingFlags, setLoadingFlags] = useState<
    Partial<Record<keyof FlagState, boolean>>
  >({});
  const [updatingRaffle, setUpdatingRaffle] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<EditRaffleFormData>({
    resolver: zodResolver(editRaffleSchema),
  });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control,
    name: "prices",
  });

  const {
    fields: awardFields,
    append: appendAward,
    remove: removeAward,
  } = useFieldArray({
    control,
    name: "awardedNumbers",
  });

  useEffect(() => {
    if (flags) {
      setFlagsState({
        flagTopBuyers: flags.flagTopBuyers,
        flagTopBuyersWeek: flags.flagTopBuyersWeek,
        flagTopBuyersDay: flags.flagTopBuyersDay,
        flagLowestQuota: flags.flagLowestQuota,
        flagHighestQuota: flags.flagHighestQuota,
        flagProgress: flags.flagProgress,
      });
    }
  }, [flags]);

  useEffect(() => {
    if (raffle) {
      reset({
        title: raffle.title,
        description: raffle.description,
        imagesUrls: raffle.imagesUrls,
        preQuantityNumbers: raffle.preQuantityNumbers,
        minQuantity: raffle.minQuantity,
        maxQuantity: raffle.maxQuantity,
        prices: raffle.prices.map((price) => ({
          id: price.id,
          quantity: price.quantity,
          pricePerUnit: price.price,
        })),
        awardedNumbers:
          raffle.awardedQuotes?.map((quote) => ({
            id: quote.id,
            reference_number: quote.referenceNumber,
            award: quote.gift,
          })) || [],
      });
    }
  }, [raffle, reset]);

  const handleToggle = async (flag: keyof FlagState) => {
    try {
      setLoadingFlags((prev) => ({ ...prev, [flag]: true }));
      const newValue = !flagsState[flag];

      // Atualiza o estado local imediatamente para feedback visual
      setFlagsState((prev) => ({
        ...prev,
        [flag]: newValue,
      }));

      // Chama a action correspondente
      const updateFlagAction = {
        flagTopBuyers: updateTopBuyersFlag,
        flagTopBuyersWeek: updateTopBuyerWeekFlag,
        flagTopBuyersDay: updateTopBuyerDayFlag,
        flagLowestQuota: updateLowestQuotaFlag,
        flagHighestQuota: updateHighestQuotaFlag,
        flagProgress: updateProgressFlag,
      }[flag];

      await updateFlagAction(raffleId, newValue);
      await mutateFlags(); // Atualiza os dados após salvar
      onSuccess?.();
    } catch (error) {
      // Em caso de erro, reverte o estado local
      setFlagsState((prev) => ({
        ...prev,
        [flag]: !prev[flag],
      }));
      console.error(`Erro ao atualizar flag ${flag}:`, error);
    } finally {
      setLoadingFlags((prev) => ({ ...prev, [flag]: false }));
    }
  };

  const imagesUrls = watch("imagesUrls");
  const removeImage = (index: number) => {
    const newImagesUrls = [...imagesUrls];
    newImagesUrls.splice(index, 1);
    setValue("imagesUrls", newImagesUrls);
  };

  const onSubmit = async (data: EditRaffleFormData) => {
    try {
      setUpdatingRaffle(true);
      await updateRaffle(raffleId, data);
      await mutateRaffle();
      onSuccess?.();
      onClose();
      toast.success("Sorteio atualizado com sucesso");
    } catch {
      toast.error("Erro ao atualizar sorteio");
    } finally {
      setUpdatingRaffle(false);
    }
  };

  if (!isOpen) return <></>;

  if (!flags || !raffle) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white text-foreground rounded-lg p-6">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 p-4 flex items-center backdrop-blur-xs justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-white text-foreground rounded-xl w-full max-w-2xl py-4 md:py-6">
        <div className="flex justify-between items-center mb-4 px-4 md:px-6">
          <h2 className="text-xl font-bold">Editar Sorteio</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 pb-2 overflow-y-auto max-h-[80vh] px-4 md:px-6 mb-2"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              {...register("title")}
              className="w-full p-2 border rounded-md"
              placeholder="Digite o título do sorteio"
            />
            {errors.title && (
              <span className="text-red-500 text-xs">
                {errors.title.message}
              </span>
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
              <span className="text-red-500 text-xs">
                {errors.description.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Imagens</label>
            <FileUpload
              path="/raffles"
              onUploadComplete={(url) => {
                setValue("imagesUrls", [...imagesUrls, url]);
              }}
            />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-4">
              {imagesUrls?.map((url, index) => (
                <div
                  key={index}
                  className="flex flex-col mb-4 border border-red-500 rounded-md p-1"
                >
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="-mb-6 z-2 cursor-pointer p-2 text-red-500 hover:text-red-700 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <Image
                    src={url}
                    alt="Imagem do sorteio"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                  />
                </div>
              ))}
              {errors.imagesUrls && (
                <span className="text-red-500 text-xs">
                  {errors.imagesUrls?.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Quantidade Mínima de Cotas
              </label>
              <input
                type="number"
                {...register("minQuantity", {
                  valueAsNumber: true,
                })}
                className="w-full p-2 border rounded-md"
                placeholder="Ex: 1"
              />
              {errors.minQuantity && (
                <span className="text-red-500 text-xs">
                  {errors.minQuantity.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantidade Máxima de Cotas
              </label>
              <input
                type="number"
                {...register("maxQuantity", {
                  valueAsNumber: true,
                })}
                className="w-full p-2 border rounded-md"
                placeholder="Ex: 999999"
              />
              {errors.maxQuantity && (
                <span className="text-red-500 text-xs">
                  {errors.maxQuantity.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preços</label>
            <div className="text-[11px] md:text-xs text-gray-500 mb-0 md:mb-4">
              <p>• Não é permitido ter preços com quantidades repetidas</p>
              <p>
                • O preço por unidade deve diminuir ou permanecer igual conforme
                a quantidade aumenta
              </p>
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
                {errors.prices?.root && (
                  <span className="text-red-500 text-xs md:col-span-2 mt-1">
                    {errors.prices.root.message}
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendPrice({ quantity: 1, pricePerUnit: 0 })}
              className="cursor-pointer flex items-center gap-2 text-sm p-2 border border-red-500 text-red-500 rounded-md hover:bg-red-100"
            >
              <Plus className="w-4 h-4" /> Adicionar preço
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cotas Premiadas
            </label>
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
                      {...register(
                        `awardedNumbers.${index}.reference_number` as const,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      className="w-full p-2 border rounded-md"
                      placeholder="Ex: 42"
                    />
                    {errors.awardedNumbers?.[index]?.reference_number && (
                      <span className="text-red-500 text-xs">
                        {
                          errors.awardedNumbers[index]?.reference_number
                            ?.message
                        }
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
                {errors.awardedNumbers?.root && (
                  <span className="text-red-500 text-xs md:col-span-2 mt-1">
                    {errors.awardedNumbers.root.message}
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Números Pré-definidos
            </label>
            <div className="text-[11px] md:text-xs text-gray-500 mb-0 md:mb-4">
              <p>• Não é permitido ter números repetidos</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {watch("preQuantityNumbers")?.map((number, index) => (
                <div key={index} className="flex flex-col mb-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        {...register(`preQuantityNumbers.${index}` as const, {
                          valueAsNumber: true,
                        })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Ex: 10"
                      />
                      {errors.preQuantityNumbers?.[index] && (
                        <span className="text-red-500 text-xs">
                          {errors.preQuantityNumbers[index]?.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.preQuantityNumbers?.root && (
              <span className="text-red-500 text-xs block mt-2">
                {errors.preQuantityNumbers.root.message}
              </span>
            )}
          </div>

          <label className="block text-sm font-bold mb-2">Flags</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Compradores */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Exibir Top Compradores</label>
              <button
                onClick={() => handleToggle("flagTopBuyers")}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flagsState.flagTopBuyers ? "bg-red-600" : "bg-gray-200"
                }`}
                disabled={loadingFlags.flagTopBuyers}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flagsState.flagTopBuyers ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Top Comprador da Semana */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Exibir Top Comprador da Semana</label>
              <button
                onClick={() => handleToggle("flagTopBuyersWeek")}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flagsState.flagTopBuyersWeek ? "bg-red-600" : "bg-gray-200"
                }`}
                disabled={loadingFlags.flagTopBuyersWeek}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flagsState.flagTopBuyersWeek
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Top Comprador do Dia */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Exibir Top Comprador do Dia</label>
              <button
                onClick={() => handleToggle("flagTopBuyersDay")}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flagsState.flagTopBuyersDay ? "bg-red-600" : "bg-gray-200"
                }`}
                disabled={loadingFlags.flagTopBuyersDay}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flagsState.flagTopBuyersDay
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Menor Cota */}
            <div className="flex items-center justify-between">
              <label className="text-sm ">Exibir Menor Cota</label>
              <button
                onClick={() => handleToggle("flagLowestQuota")}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flagsState.flagLowestQuota ? "bg-red-600" : "bg-gray-200"
                }`}
                disabled={loadingFlags.flagLowestQuota}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flagsState.flagLowestQuota
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Maior Cota */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Exibir Maior Cota</label>
              <button
                onClick={() => handleToggle("flagHighestQuota")}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flagsState.flagHighestQuota ? "bg-red-600" : "bg-gray-200"
                }`}
                disabled={loadingFlags.flagHighestQuota}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flagsState.flagHighestQuota
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Exibir Progresso</label>
              <button
                onClick={() => handleToggle("flagProgress")}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flagsState.flagProgress ? "bg-red-600" : "bg-gray-200"
                }`}
                disabled={loadingFlags.flagProgress}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flagsState.flagProgress ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              disabled={updatingRaffle}
              onClick={onClose}
              className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              disabled={updatingRaffle}
              type="submit"
              className="cursor-pointer px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingRaffle ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRaffleModal;
