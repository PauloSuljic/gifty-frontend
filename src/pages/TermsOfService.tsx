import Layout from "../components/layout/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10 text-white">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

        <p className="mb-4 text-gray-300">
          Welcome to Gifty! By using our service, you agree to the following terms:
        </p>

        <ol className="list-decimal ml-6 text-gray-400 space-y-3">
          <li>
            <strong>Account Responsibility:</strong> You are responsible for your login credentials and any activity under your account.
          </li>
          <li>
            <strong>Appropriate Use:</strong> Do not use Gifty to post offensive, harmful, or illegal content.
          </li>
          <li>
            <strong>Data & Availability:</strong> While we aim to keep Gifty reliable, we cannot guarantee uptime or data integrity.
          </li>
          <li>
            <strong>Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms.
          </li>
        </ol>

        <p className="mt-6 text-sm text-gray-500">
          Last updated: April 8, 2025
        </p>
      </div>
    </Layout>
  );
};

export default TermsOfService;
