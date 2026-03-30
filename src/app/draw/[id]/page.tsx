import { redirect } from "next/navigation";

interface DrawingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DrawingPage({ params }: DrawingPageProps) {
  const { id } = await params;
  redirect(`/draw/live/${id}`);
}
