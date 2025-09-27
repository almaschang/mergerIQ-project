import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface NewsItemProps {
  headline: string;
  url: string;
  datetime: number;
  source: string;
}

export default function NewsItem({ headline, url, datetime, source }: NewsItemProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:bg-gray-50 -mx-6 px-6 py-3"
    >
      <h3 className="text-sm font-medium text-gray-900">{headline}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {formatDistanceToNow(new Date(datetime * 1000))} ago • {source}
      </p>
    </a>
  );
}