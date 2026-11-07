import type { HomeContent } from './types';
/**
 * YOU control the homepage visuals. Two ways, same shape (Firestore overrides this file):
 *  1) edit the defaults below, or
 *  2) create the Firestore doc  site_content/home  with the same fields.
 *
 * phoneScreens : exactly the images shown inside the phone frame, in order. Empty = placeholder (never random).
 * featured     : projects in the order you want. The FIRST one is the big hero project.
 *   projectId  : the project's Firestore id or its slug
 *   image      : any image URL, any aspect ratio (landscape is fine)
 *   fit        : 'cover' (fills) or 'contain' (shows the whole image)
 *   focus      : CSS object-position, e.g. 'top', 'center 20%'
 * Projects not listed in `featured` follow, newest first.
 */
export const defaults: HomeContent = { phoneScreens: [], featured: [] };
