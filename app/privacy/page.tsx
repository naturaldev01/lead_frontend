"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: February 20, 2026
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              We collect information you provide directly to us, such as when you create an account,
              connect your Meta Ads account, or contact us for support. This includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Email address and account credentials</li>
              <li>Meta Ads account information and access tokens</li>
              <li>Lead form submission data from your Meta campaigns</li>
              <li>Campaign performance metrics and spending data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Provide, maintain, and improve our services</li>
              <li>Sync and display your Meta Ads lead data</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              We take reasonable measures to help protect your personal information from loss, theft,
              misuse, unauthorized access, disclosure, alteration, and destruction. All data is
              encrypted in transit and at rest using industry-standard encryption protocols.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              We retain your information for as long as your account is active or as needed to provide
              you services. You can request deletion of your data at any time by contacting our support
              team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              Our service integrates with Meta (Facebook) Ads platform. Your use of Meta services is
              subject to Meta&apos;s own privacy policy and terms of service. We only access the data you
              explicitly authorize through the Meta API.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              <strong>Email:</strong> privacy@marketingleads.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
