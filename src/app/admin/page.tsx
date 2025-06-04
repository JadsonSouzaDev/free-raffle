import { getRaffles } from "../contexts/raffle/raffle.actions";
import { getOrders } from "../contexts/order/order.actions";
import { getUsers } from "../contexts/user/user.actions";
import Common from "./_components/common";
import { RaffleList } from "./_components/RaffleList";
import { OrderList } from "./_components/OrderList";
import { UserList } from "./_components/UserList";

type OrderStatus =
  | "pending"
  | "waiting_payment"
  | "completed"
  | "canceled"
  | "refunded"
  | "expired";

export default async function AdminPage() {
  // Aqui você pode buscar os dados reais dos sorteios
  const raffles = await getRaffles();
  const ordersResponse = await getOrders();
  const { data: orders, ...ordersPagination } = ordersResponse;
  const usersResponse = await getUsers();
  const { data: users, ...usersPagination } = usersResponse;

  return (
    <Common
      tabs={[
        {
          label: "Sorteios",
          content: (
            <div>
              <h2 className="text-xl font-bold mb-4">Gerenciar Sorteios</h2>
              <RaffleList
                raffles={raffles.map((raffle) => ({
                  id: raffle.id,
                  title: raffle.title,
                  description: raffle.description,
                  status: raffle.status,
                  createdAt: raffle.createdAt.toISOString(),
                  quotasSold: raffle.quotasSold || 0,
                  prices: raffle.prices.map((price) => ({
                    id: price.id,
                    price: price.price,
                    quantity: price.quantity,
                  })),
                  awardedQuotes:
                    raffle.awardedQuotes?.map((quote) => ({
                      id: quote.id,
                      referenceNumber: quote.referenceNumber,
                      gift: quote.gift,
                    })) || [],
                }))}
              />
            </div>
          ),
        },
        {
          label: "Pedidos",
          content: (
            <div>
              <h2 className="text-xl font-bold mb-4">Gerenciar Pedidos</h2>
              <OrderList
                orders={orders.map(
                  (order: {
                    id: string;
                    raffleId: string;
                    userId: string;
                    quotasQuantity: number;
                    status: OrderStatus;
                    createdAt: Date;
                    payment?: {
                      amount: number;
                      gateway: string;
                      type: string;
                    };
                    quotas: number[];
                  }) => ({
                    id: order.id,
                    raffleId: order.raffleId,
                    userId: order.userId,
                    quantity: order.quotasQuantity,
                    status: order.status,
                    createdAt: order.createdAt.toISOString(),
                    amount: order.payment?.amount || 0,
                    gateway: order.payment?.gateway || "",
                    type: order.payment?.type || "pix",
                    quotas: order.quotas,
                  })
                )}
                initialPagination={ordersPagination}
              />
            </div>
          ),
        },
        {
          label: "Usuários",
          content: (
            <div>
              <h2 className="text-xl font-bold mb-4">Gerenciar Usuários</h2>
              <UserList
                users={users.map((user) => ({
                  whatsapp: user.whatsapp,
                  name: user.name,
                  roles: user.roles,
                  createdAt: user.createdAt.toISOString(),
                  updatedAt: user.updatedAt.toISOString(),
                }))}
                initialPagination={usersPagination}
              />
            </div>
          ),
        },
        {
          label: "Infos",
          content: (
            <div>
              <h2 className="text-xl font-bold mb-4">Infos</h2>
              {/* Conteúdo da tab de configurações */}
            </div>
          ),
        },
      ]}
    />
  );
}
