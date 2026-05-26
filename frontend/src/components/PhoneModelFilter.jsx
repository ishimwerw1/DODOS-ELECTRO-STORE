import { useSearchParams } from 'react-router-dom';

const phoneModels = [
  { name: "All Brands", value: "All", icon: "📱" },
  { name: "iPhone", value: "iPhone", icon: "🍎" },
  { name: "Samsung", value: "Samsung", icon: "🌌" },
  { name: "Tecno", value: "Tecno", icon: "⚡" },
  { name: "Infinix", value: "Infinix", icon: "🔥" },
  { name: "Xiaomi", value: "Xiaomi", icon: "🍊" },
  { name: "Huawei", value: "Huawei", icon: "🌸" },
];

const PhoneModelFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedModel = searchParams.get('model') || 'All';

  const handleModelChange = (model) => {
    if (model === 'All') {
      searchParams.delete('model');
    } else {
      searchParams.set('model', model);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="py-4">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {phoneModels.map((model) => (
          <button
            key={model.value}
            onClick={() => handleModelChange(model.value)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 min-w-[100px]
              ${selectedModel === model.value 
                ? 'bg-primary text-black shadow-lg scale-105 font-bold ring-2 ring-primary ring-offset-2' 
                : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md border border-gray-100'
              }
            `}
          >
            <span className="text-2xl mb-2">{model.icon}</span>
            <span className="text-sm uppercase tracking-wider font-semibold">{model.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PhoneModelFilter;
