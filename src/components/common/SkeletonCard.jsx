const SkeletonCard = ({ variant = "default" }) => {
  if (variant === "horizontal") {
    return (
      <div className="flex-shrink-0 w-64 bg-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="w-full h-36 bg-gray-300"></div>
        <div className="p-3">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="w-full aspect-video bg-gray-300"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;

