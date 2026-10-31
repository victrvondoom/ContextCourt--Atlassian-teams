import { describe, expect, it } from 'vitest';
import { adfToText, isAdfDocument } from '../../src/integrations/adf';

describe('ADF → text extraction (CC-001 regression)', () => {
  it('extracts text from a realistic ADF description document', () => {
    const doc = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'The refund window must be ' },
            { type: 'text', text: '30 days', marks: [{ type: 'strong' }] },
            { type: 'text', text: ' per the controller.' },
          ],
        },
      ],
    };
    expect(adfToText(doc)).toBe('The refund window must be 30 days per the controller.');
  });

  it('puts block nodes on separate lines', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Line one.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Criteria' }] },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item A' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item B' }] }],
            },
          ],
        },
      ],
    };
    expect(adfToText(doc).split('\n')).toEqual(['Line one.', 'Criteria', 'Item A', 'Item B']);
  });

  it('returns empty string for null/undefined/non-object values instead of throwing', () => {
    expect(adfToText(null)).toBe('');
    expect(adfToText(undefined)).toBe('');
    expect(adfToText(42)).toBe('');
    expect(adfToText([])).toBe('');
    expect(adfToText({})).toBe('');
  });

  it('tolerates plain strings (older deployment shapes, fixtures)', () => {
    expect(adfToText('plain description')).toBe('plain description');
  });

  it('traverses unknown node types defensively', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'customFutureNode',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hidden text' }] }],
        },
      ],
    };
    expect(adfToText(doc)).toBe('hidden text');
  });

  it('isAdfDocument distinguishes documents from plain values', () => {
    expect(isAdfDocument({ type: 'doc' })).toBe(true);
    expect(isAdfDocument('string')).toBe(false);
    expect(isAdfDocument(null)).toBe(false);
  });
});
