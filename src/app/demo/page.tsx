import { DemoPageClient } from "@/components/demo/DemoPageClient";

export const metadata = {
  title: "SMB concepts demo · AgentFish",
  description:
    "Prototype ideas: verified suppliers, LCL pooling, duty drawback, and community ratings for Canadian SMBs.",
};

export default function DemoPage() {
  return <DemoPageClient />;
}
