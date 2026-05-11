import { TransactionDetail } from "@/features/dashboard/wallet/TransactionDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params;
  return <TransactionDetail id={id} />;
}
