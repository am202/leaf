/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { AdminHelpContentDTO } from '../../models/admin/Help';
import { HttpFactory } from '../HttpFactory';

/*
 * Gets help page category, title, and content.
 */
export const getAdminHelpPageAndContent = async (state: AppState, pageId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/help/${pageId}`);
    return resp.data as AdminHelpContentDTO;
};

/*
 * Creates help page title and content, and category if it doesn't exist.
 */
export const createAdminHelpPageAndContent = async (state: AppState, page: AdminHelpContentDTO) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post('api/admin/help', page);
    return resp.data as AdminHelpContentDTO;
};

/*
 * Updates help page category, title, and content.
 */
export const updateAdminHelpPageAndContent = async (state: AppState, page: AdminHelpContentDTO, pageId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/help/${pageId}`, page);
    return resp.data as AdminHelpContentDTO;
};

/*
 * Deletes help page category, title, and content.
 */
export const deleteAdminHelpPageAndContent = async (state: AppState, pageId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/help/${pageId}`);
};