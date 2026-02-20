"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Subscription {
  id: string;
  accountName: string;
  accountId: string;
  status: "subscribed" | "not_subscribed" | "error";
  fields: string;
  lastAttempt: string | null;
  lastSuccess: string | null;
  lastError: string | null;
}

const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    accountName: "Natural Care",
    accountId: "act_447318237318335",
    status: "subscribed",
    fields: "leadgen,ads,adsets,campaigns",
    lastAttempt: "14.02.2026 15:20:05",
    lastSuccess: "14.02.2026 15:20:05",
    lastError: null,
  },
  {
    id: "2",
    accountName: "Natural Clinic Turkey",
    accountId: "act_555680213653953",
    status: "subscribed",
    fields: "leadgen,ads,adsets,campaigns",
    lastAttempt: "15.02.2026 14:20:00",
    lastSuccess: "15.02.2026 14:20:00",
    lastError: null,
  },
  {
    id: "3",
    accountName: "Natural Clinic EU",
    accountId: "act_795458186742642",
    status: "subscribed",
    fields: "leadgen,ads,adsets,campaigns",
    lastAttempt: "14.02.2026 15:20:07",
    lastSuccess: "14.02.2026 15:20:07",
    lastError: null,
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [refreshing, setRefreshing] = useState(false);
  const [autoSubscribing, setAutoSubscribing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setRefreshing(false);
    }
  };

  const handleAutoSubscribe = async () => {
    setAutoSubscribing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setAutoSubscribing(false);
    }
  };

  const getStatusBadge = (status: Subscription["status"]) => {
    switch (status) {
      case "subscribed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Subscribed
          </Badge>
        );
      case "not_subscribed":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Not Subscribed
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            Error
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ad Account Subscriptions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Webhook subscription status for all accessible Meta ad accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAutoSubscribe} disabled={autoSubscribing}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {autoSubscribing ? "Subscribing..." : "Auto-Subscribe Now"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription State ({subscriptions.length} accounts)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Last Attempt</TableHead>
                <TableHead>Last Success</TableHead>
                <TableHead>Last Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No ad accounts found
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {subscription.accountName}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">
                      {subscription.accountId}
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {subscription.fields || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {subscription.lastAttempt || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {subscription.lastSuccess || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-red-500">
                      {subscription.lastError || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
