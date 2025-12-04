"use client";

import { useState, useEffect } from 'react';
import type { ReferenceMetadata, ReferenceMetadataState } from '@/lib/types/reference';

export type { ReferenceMetadata, ReferenceMetadataState };

// Leading journals mapping
const LEADING_JOURNALS: Record<string, string> = {
  'new england journal of medicine': 'NEJM',
  'nejm': 'NEJM',
  'n engl j med': 'NEJM',
  'lancet': 'Lancet',
  'the lancet': 'Lancet',
  'jama': 'JAMA',
  'journal of the american medical association': 'JAMA',
  'bmj': 'BMJ',
  'british medical journal': 'BMJ',
  'nature': 'Nature',
  'nature medicine': 'Nature Medicine',
  'science': 'Science',
  'circulation': 'Circulation',
  'european heart journal': 'Eur Heart J',
  'eur heart j': 'Eur Heart J',
  'annals of internal medicine': 'Ann Intern Med',
  'cochrane database of systematic reviews': 'Cochrane',
  'cochrane database syst rev': 'Cochrane',
  'diabetes care': 'Diabetes Care',
  'kidney international': 'Kidney Int',
};

// Cache for metadata
const metadataCache = new Map<string, ReferenceMetadata>();

/**
 * Extract DOI from URL
 */
function extractDOI(url: string): string | null {
  const doiMatch = url.match(/doi\.org\/(10\.\d{4,9}\/[^\s\?#]+)/i);
  return doiMatch ? doiMatch[1] : null;
}

/**
 * Hook to fetch reference metadata from DOI
 * Returns metadata with loading and error states
 */
export function useReferenceMetadata(url: string | null, fallbackTitle: string): ReferenceMetadataState {
  const [state, setState] = useState<ReferenceMetadataState>({
    metadata: {
      title: fallbackTitle,
      authors: '',
      journal: '',
      publishedDate: '',
      year: '',
      source: '',
      isLeadingJournal: false,
    },
    isLoading: false,
    error: false,
  });

  useEffect(() => {
    if (!url) return;

    // Check cache first
    const cached = metadataCache.get(url);
    if (cached) {
      setState({ metadata: cached, isLoading: false, error: false });
      return;
    }

    const doi = extractDOI(url);
    if (!doi) {
      // No DOI, can't fetch metadata
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: false }));

    // Fetch from CrossRef API
    fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
      .then(res => {
        if (!res.ok) throw new Error('CrossRef API error');
        return res.json();
      })
      .then(data => {
        const work = data.message;
        if (!work) throw new Error('No data');

        // Extract title
        const title = work.title?.[0] || fallbackTitle;

        // Extract authors
        const authorList = work.author || [];
        const authorNames = authorList.slice(0, 3).map((a: any) => {
          if (a.given && a.family) {
            return `${a.given} ${a.family}`;
          }
          return a.name || a.family || '';
        }).filter(Boolean);
        
        if (authorList.length > 3) {
          authorNames.push('et al.');
        }
        const authors = authorNames.join(', ');

        // Extract journal
        const journal = work['container-title']?.[0] || '';

        // Extract date
        let publishedDate = '';
        let year = '';
        const dateParts = work.published?.['date-parts']?.[0] ||
                          work['published-print']?.['date-parts']?.[0] ||
                          work['published-online']?.['date-parts']?.[0];

        if (dateParts) {
          year = dateParts[0]?.toString() || '';
          const months = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
          
          if (dateParts.length >= 3) {
            publishedDate = `${months[dateParts[1] - 1]} ${dateParts[2]}, ${dateParts[0]}`;
          } else if (dateParts.length >= 2) {
            publishedDate = `${months[dateParts[1] - 1]} ${dateParts[0]}`;
          } else {
            publishedDate = year;
          }
        }

        // Determine source and leading journal status
        const journalLower = journal.toLowerCase();
        let source = journal.split(' ').slice(0, 3).join(' '); // Abbreviate long names
        let isLeadingJournal = false;

        for (const [key, abbrev] of Object.entries(LEADING_JOURNALS)) {
          if (journalLower.includes(key)) {
            source = abbrev;
            isLeadingJournal = true;
            break;
          }
        }

        const metadata: ReferenceMetadata = {
          title,
          authors,
          journal,
          publishedDate,
          year,
          source,
          isLeadingJournal,
        };

        // Cache the result
        metadataCache.set(url, metadata);
        setState({ metadata, isLoading: false, error: false });
      })
      .catch(err => {
        console.warn('Failed to fetch metadata:', err);
        setState(prev => ({ ...prev, isLoading: false, error: true }));
      });
  }, [url, fallbackTitle]);

  return state;
}

/**
 * Clear the metadata cache (useful for testing)
 */
export function clearReferenceMetadataCache(): void {
  metadataCache.clear();
}
