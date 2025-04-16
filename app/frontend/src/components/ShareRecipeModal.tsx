import { useState } from "react";
import { api } from "../api";

interface ShareRecipeModalProps {
  recipeId: number;
  recipeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareRecipeModal({
  recipeId,
  recipeName,
  isOpen,
  onClose,
}: ShareRecipeModalProps) {
  const [shareType, setShareType] = useState<"email" | "sms" | "link">("email");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle share form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (shareType !== "link" && !recipient) {
        setError(
          `Please enter a valid ${
            shareType === "email" ? "email address" : "phone number"
          }`
        );
        return;
      }

      // Share recipe
      const response = await api.post(`/sharing/recipes/${recipeId}`, {
        sharedWith: shareType === "link" ? "public" : recipient,
        shareType,
        message: message || undefined,
        expiresInDays:
          shareType === "link" ? parseInt(expiresInDays) : undefined,
      });

      if (response.data.success) {
        setSuccess(true);
        setShareUrl(response.data.share.shareUrl);

        // Clear form if not link sharing
        if (shareType !== "link") {
          setRecipient("");
          setMessage("");
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error sharing recipe:", error);
      setError(
        err.response?.data?.message ||
          "An error occurred while sharing the recipe"
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy share URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  // Reset form when modal closes
  const handleClose = () => {
    setShareType("email");
    setRecipient("");
    setMessage("");
    setExpiresInDays("7");
    setShareUrl("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-headline"
              >
                Share Recipe
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Share "{recipeName}" with friends and family.
                </p>
              </div>

              {success && shareUrl ? (
                <div className="mt-4">
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          {shareType === "email"
                            ? `Recipe shared via email to ${recipient}`
                            : shareType === "sms"
                            ? `Recipe shared via SMS to ${recipient}`
                            : "Recipe link created successfully"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {shareType === "link" && (
                    <div className="mt-4">
                      <label
                        htmlFor="share-url"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Share URL
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="share-url"
                          id="share-url"
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                          value={shareUrl}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        This link will expire in {expiresInDays} days.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => {
                        setSuccess(false);
                        setShareUrl("");
                      }}
                    >
                      Share Again
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form className="mt-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Share via
                    </label>
                    <div className="mt-2 flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="share-email"
                          name="share-type"
                          type="radio"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                          checked={shareType === "email"}
                          onChange={() => setShareType("email")}
                        />
                        <label
                          htmlFor="share-email"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Email
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="share-sms"
                          name="share-type"
                          type="radio"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                          checked={shareType === "sms"}
                          onChange={() => setShareType("sms")}
                        />
                        <label
                          htmlFor="share-sms"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          SMS
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="share-link"
                          name="share-type"
                          type="radio"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                          checked={shareType === "link"}
                          onChange={() => setShareType("link")}
                        />
                        <label
                          htmlFor="share-link"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Generate Link
                        </label>
                      </div>
                    </div>
                  </div>

                  {shareType !== "link" && (
                    <div className="mb-4">
                      <label
                        htmlFor="recipient"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {shareType === "email"
                          ? "Email Address"
                          : "Phone Number"}
                      </label>
                      <div className="mt-1">
                        <input
                          type={shareType === "email" ? "email" : "tel"}
                          name="recipient"
                          id="recipient"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder={
                            shareType === "email"
                              ? "friend@example.com"
                              : "+1 (555) 123-4567"
                          }
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {shareType === "link" && (
                    <div className="mb-4">
                      <label
                        htmlFor="expires"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Link Expires In
                      </label>
                      <div className="mt-1">
                        <select
                          id="expires"
                          name="expires"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={expiresInDays}
                          onChange={(e) => setExpiresInDays(e.target.value)}
                        >
                          <option value="1">1 day</option>
                          <option value="7">7 days</option>
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                          <option value="365">1 year</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Message (optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add a personal message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Sharing..." : "Share Recipe"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
