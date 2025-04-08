import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardContent } from '../components/ui';

export function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <Card>
          <CardContent>
            <div className="prose max-w-none">
              <p>Last updated: January 1, 2023</p>
              
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using RecCollection ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
              
              <h2>2. Description of Service</h2>
              <p>
                RecCollection is a platform that allows users to create, store, share, and discover recipes. The Service includes features for importing recipes from social media, organizing personal recipe collections, and interacting with other users.
              </p>
              
              <h2>3. User Accounts</h2>
              <p>
                To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to:
              </p>
              <ul>
                <li>Provide accurate and complete information when creating your account</li>
                <li>Update your information to keep it accurate and current</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
              
              <h2>4. User Content</h2>
              <p>
                The Service allows you to create, upload, and share content, including recipes, images, and comments ("User Content"). By submitting User Content, you:
              </p>
              <ul>
                <li>Retain ownership rights to your User Content</li>
                <li>Grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with the Service</li>
                <li>Represent that you own or have the necessary rights to your User Content</li>
                <li>Understand that you are solely responsible for your User Content</li>
              </ul>
              
              <h2>5. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Attempt to access areas of the Service you are not authorized to access</li>
                <li>Use the Service to collect or harvest user data</li>
                <li>Post content that is defamatory, obscene, or otherwise objectionable</li>
              </ul>
              
              <h2>6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by RecCollection and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              
              <h2>7. Third-Party Links and Services</h2>
              <p>
                The Service may contain links to third-party websites or services that are not owned or controlled by RecCollection. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
              
              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
              </p>
              
              <h2>9. Limitation of Liability</h2>
              <p>
                In no event shall RecCollection, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
              
              <h2>10. Disclaimer</h2>
              <p>
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free.
              </p>
              
              <h2>11. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms of Service at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              
              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
              
              <h2>13. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:terms@reccollection.com" className="text-blue-600 hover:underline">terms@reccollection.com</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
