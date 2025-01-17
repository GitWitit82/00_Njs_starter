import { Metadata } from "next"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Card Based Layout",
  description: "A card-based layout example",
}

export default function CardBasedLayout() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Card Based Layout</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Card 1</h2>
          <p className="text-muted-foreground">
            Here&apos;s an example of a card-based layout. Each card contains
            different content and can be arranged in a grid.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Card 2</h2>
          <p className="text-muted-foreground">
            Cards are great for organizing content into digestible chunks. They
            can contain text, images, or any other content.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Card 3</h2>
          <p className="text-muted-foreground">
            The grid layout automatically adjusts based on screen size, ensuring
            a responsive design that works well on all devices.
          </p>
        </Card>
      </div>
    </div>
  )
} 