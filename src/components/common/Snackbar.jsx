import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectSnackbarState, hideSnackbar } from "../../features/notification/snackbarSlice";

const Snackbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { open, title, subtitle, link, duration } = useSelector(selectSnackbarState);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        dispatch(hideSnackbar());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, dispatch]);

  const handleLinkClick = () => {
    if (link?.url) {
      navigate(link.url);
      dispatch(hideSnackbar());
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {title && (
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">
                {subtitle}
              </p>
            )}
            {link && (
              <button
                onClick={handleLinkClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
              >
                {link.text}
              </button>
            )}
          </div>
          <button
            onClick={() => dispatch(hideSnackbar())}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Snackbar;

