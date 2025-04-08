import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardContent } from '../components/ui';

export function PrivacyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <Card>
          <CardContent>
            <div className="prose max-w-none">
              <p>Last updated: January 1, 2023</p>
              
              <h2>Introduction</h2>
              <p>
                RecCollection ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              
              <h2>Information We Collect</h2>
              <p>We may collect information about you in various ways, including:</p>
              <ul>
                <li>
                  <strong>Personal Information:</strong> When you register for an account, we collect your name, email address, username, and password.
                </li>
                <li>
                  <strong>Profile Information:</strong> You may choose to provide additional information such as a profile picture, bio, and social media links.
                </li>
                <li>
                  <strong>Recipe Information:</strong> We collect the recipes you create, save, or import, including ingredients, instructions, images, and metadata.
                </li>
                <li>
                  <strong>Usage Information:</strong> We collect information about how you interact with our service, including the pages you visit, the features you use, and the time spent on our platform.
                </li>
                <li>
                  <strong>Device Information:</strong> We may collect information about your device, including IP address, browser type, operating system, and device identifiers.
                </li>
              </ul>
              
              <h2>How We Use Your Information</h2>
              <p>We may use the information we collect for various purposes, including:</p>
              <ul>
                <li>Providing, maintaining, and improving our services</li>
                <li>Processing and completing transactions</li>
                <li>Sending you technical notices, updates, and administrative messages</li>
                <li>Responding to your comments, questions, and requests</li>
                <li>Personalizing your experience and delivering content relevant to your interests</li>
                <li>Monitoring and analyzing trends, usage, and activities in connection with our services</li>
                <li>Detecting, investigating, and preventing fraudulent transactions and other illegal activities</li>
              </ul>
              
              <h2>Sharing Your Information</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul>
                <li>With service providers who perform services on our behalf</li>
                <li>With other users when you choose to make your recipes public</li>
                <li>In response to a legal request if we believe disclosure is required by law</li>
                <li>In connection with a merger, sale, or acquisition of all or a portion of our company</li>
              </ul>
              
              <h2>Your Choices</h2>
              <p>You have several choices regarding the use of your information:</p>
              <ul>
                <li>
                  <strong>Account Information:</strong> You can update your account information at any time by accessing your account settings.
                </li>
                <li>
                  <strong>Recipe Privacy:</strong> You can choose whether your recipes are public or private.
                </li>
                <li>
                  <strong>Marketing Communications:</strong> You can opt out of receiving promotional emails by following the instructions in those emails.
                </li>
                <li>
                  <strong>Cookies:</strong> Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject cookies.
                </li>
              </ul>
              
              <h2>Data Security</h2>
              <p>
                We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
              </p>
              
              <h2>Children's Privacy</h2>
              <p>
                Our services are not directed to children under 13, and we do not knowingly collect personal information from children under 13. If we learn we have collected personal information from a child under 13, we will delete that information.
              </p>
              
              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through our platform prior to the changes becoming effective.
              </p>
              
              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@reccollection.com" className="text-blue-600 hover:underline">privacy@reccollection.com</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
