import './App.css';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to My Dark Mode App!</h1>
        <p className="text-xl mb-8">This is a simple homepage with everything centered and styled in dark mode.</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default App;
