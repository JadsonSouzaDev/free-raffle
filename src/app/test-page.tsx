import { createRaffle, getRaffles } from "./contexts/raffle/raffle.actions";
import { revalidatePath } from "next/cache";
import { RaffleForm } from "./components/RaffleForm";

export default async function Page() {
  const raffles = await getRaffles();

  async function handleSubmit(formData: FormData) {
    'use server';
    
    // Converter os preços do FormData para o formato esperado
    const pricesData = [];
    const priceKeys = Array.from(formData.keys()).filter(key => key.startsWith('price_'));
    
    for (const key of priceKeys) {
      const index = key.split('_')[1];
      const price = formData.get(`price_${index}`);
      const quantity = formData.get(`quantity_${index}`);
      
      if (price && quantity) {
        pricesData.push({
          price: Number(price),
          quantity: Number(quantity)
        });
      }
    }
    
    formData.set('prices', JSON.stringify(pricesData));
    await createRaffle(formData);
    revalidatePath('/');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Minhas Rifas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {raffles.map((raffle) => (
            <div key={raffle.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{raffle.title}</h2>
              <p className="text-gray-600 mb-4">{raffle.description}</p>
              {raffle.prices && raffle.prices.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Preços:</h3>
                  <ul className="space-y-1">
                    {raffle.prices.map((price, index) => (
                      <li key={index} className="text-sm">
                        {price.quantity} cotas por R$ {price.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-sm text-gray-500 mt-4">
                Criado em: {new Date(raffle.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Criar Nova Rifa</h2>
        <RaffleForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
