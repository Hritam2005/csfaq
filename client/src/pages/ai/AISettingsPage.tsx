import React from 'react';

export const AISettingsPage: React.FC = () => {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">AI Settings</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Configure your autonomous workspace.</p>
        </div>

        <div className="space-y-8">
          {/* Model Selection */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Model Selection</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 rounded-lg border border-primary-500 bg-primary-50 p-4 dark:border-primary-500/50 dark:bg-primary-900/20">
                <input type="radio" name="model" className="mt-1 text-primary-600 focus:ring-primary-500" defaultChecked />
                <div>
                  <span className="block font-semibold text-gray-900 dark:text-white">Enterprise Standard (Default)</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Balanced for speed and accurate retrieval processing.</span>
                </div>
              </label>
              
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <input type="radio" name="model" className="mt-1 text-primary-600 focus:ring-primary-500" />
                <div>
                  <span className="block font-semibold text-gray-900 dark:text-white">Enterprise Ultra</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Slower but deeply analytical. Best for complex reasoning tasks across many documents.</span>
                </div>
              </label>
            </div>
          </section>

          {/* Response Style */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Response Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-semibold text-gray-900 dark:text-white">Stream Responses</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">See the response generated in real-time.</span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <div>
                  <span className="block font-semibold text-gray-900 dark:text-white">Inline Citations</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Always append source references to factual claims.</span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800"></div>
                </label>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
