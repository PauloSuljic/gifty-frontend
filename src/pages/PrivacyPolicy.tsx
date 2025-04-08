import Layout from "../components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10 text-white">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4 text-gray-300">
          Your privacy is important to us. Here’s how we handle your data:
        </p>

        <ul className="list-disc ml-6 text-gray-400 space-y-3">
          <li>
            <strong>Account Info:</strong> We collect your username, email, and optional bio to personalize your experience.
          </li>
          <li>
            <strong>Usage Tracking:</strong> We may collect anonymous analytics data to improve performance and user experience.
          </li>
          <li>
            <strong>Third-party Services:</strong> We use Firebase for authentication. Your data is stored securely.
          </li>
          <li>
            <strong>Data Deletion:</strong> You can delete your account at any time from Settings. This will remove all your data.
          </li>
        </ul>

        <p className="mt-6 text-sm text-gray-500">
          Last updated: April 8, 2025
        </p>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
