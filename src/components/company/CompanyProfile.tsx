import React from 'react';
import { Globe, Phone, Building2 } from 'lucide-react';
import { CompanyProfile as ICompanyProfile } from '../../types/company';

interface CompanyProfileProps {
  profile: ICompanyProfile;
}

export default function CompanyProfile({ profile }: CompanyProfileProps) {
  return (
    <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
      <div className="flex items-center">
        {profile.logo && (
          <img
            src={profile.logo}
            alt={`${profile.name} logo`}
            className="h-16 w-16 rounded-full"
          />
        )}
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{profile.ticker} • {profile.exchange}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <a href={profile.weburl} target="_blank" rel="noopener noreferrer" 
             className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
            Company Website
          </a>
        </div>
        <div className="flex items-center">
          <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span className="ml-2 text-gray-900 dark:text-gray-300">{profile.phone}</span>
        </div>
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span className="ml-2 text-gray-900 dark:text-gray-300">{profile.industry}</span>
        </div>
      </div>
    </div>
  );
}