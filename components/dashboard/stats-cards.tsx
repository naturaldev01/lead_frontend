"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users } from "lucide-react";

interface StatsCardsProps {
  totalSpend: number;
  totalLeads: number;
}

export function StatsCards({ totalSpend, totalLeads }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Spend
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                USD invested in ads
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Leads
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalLeads.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Form submissions
              </p>
            </div>
            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/20">
              <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
