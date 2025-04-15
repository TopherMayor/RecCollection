import { MainLayout } from "../components/layout";

function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About RecCollection</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            RecCollection was created with a simple mission: to help home cooks organize, discover, and share their favorite recipes. 
            We believe that cooking should be accessible to everyone, and that the joy of creating and sharing food brings people together.
          </p>
          <p className="text-gray-700">
            Our platform makes it easy to save recipes from across the web, import from social media, and create your own digital cookbook 
            that you can access anytime, anywhere.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">
            RecCollection started as a personal project to solve a common problem: having recipes scattered across 
            bookmarks, screenshots, social media saves, and handwritten notes. We wanted to create a single place 
            where all these recipes could live, be organized, and be easily accessible.
          </p>
          <p className="text-gray-700">
            What began as a simple tool has grown into a community of food lovers who share their culinary creations 
            and inspire each other to try new dishes and techniques.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Our Team</h2>
          <p className="text-gray-700 mb-4">
            We're a small team of food enthusiasts and technology experts who are passionate about creating 
            tools that make cooking more enjoyable and accessible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="font-bold">Jane Doe</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="font-bold">John Smith</h3>
              <p className="text-gray-600">CTO</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="font-bold">Emily Johnson</h3>
              <p className="text-gray-600">Head of Content</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AboutPage;
