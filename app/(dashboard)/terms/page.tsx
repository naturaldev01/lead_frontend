"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Last updated: February 20, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            By accessing or using the Marketing Leads Dashboard service, you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Description of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Marketing Leads Dashboard is a platform that allows users to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li>Connect and sync Meta (Facebook) Ads accounts</li>
            <li>Track and manage lead form submissions</li>
            <li>Monitor campaign spend and performance metrics</li>
            <li>Configure webhook subscriptions for real-time lead notifications</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            As a user of our service, you agree to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li>Provide accurate and complete information when creating an account</li>
            <li>Maintain the security of your account credentials</li>
            <li>Use the service only for lawful purposes</li>
            <li>Comply with Meta's terms of service when using integrated features</li>
            <li>Not attempt to access data belonging to other users</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Usage and Meta Integration</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Our service requires access to your Meta Ads account data. By using our service, you
            authorize us to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li>Access your ad account information and campaign data</li>
            <li>Retrieve lead form submissions via the Meta Lead Ads API</li>
            <li>Subscribe to webhooks for real-time lead notifications</li>
            <li>Store and display this data within our platform</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            The service is provided "as is" without warranties of any kind. We shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages resulting from
            your use of the service, including but not limited to loss of data or business interruption.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Service Availability</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            We strive to maintain high availability but do not guarantee uninterrupted access to the
            service. We may perform maintenance or updates that temporarily affect service availability.
            We are not responsible for any delays or failures caused by Meta's API or third-party services.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Termination</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            We reserve the right to suspend or terminate your account at any time for violation of
            these terms. You may also terminate your account at any time by contacting our support team.
            Upon termination, your access to the service will be revoked and your data may be deleted.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            We may update these Terms of Service from time to time. We will notify you of any changes
            by posting the new terms on this page and updating the "Last updated" date. Your continued
            use of the service after such changes constitutes acceptance of the new terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Contact</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            For questions about these Terms of Service, please contact us at:
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            <strong>Email:</strong> legal@marketingleads.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
