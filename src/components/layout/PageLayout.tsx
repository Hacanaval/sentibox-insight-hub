
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PageLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

const PageLayout = ({ children, title, description }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-2 text-gray-600">{description}</p>}
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
