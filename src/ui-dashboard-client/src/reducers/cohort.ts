/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    CohortAction,
    SET_COHORT_DATASETS,
    SET_COHORT_STATE,
    SET_COMPARISON_DATASET,
    SET_SEARCH_HINTS,
    SET_SEARCH_TERM
} from '../actions/cohort';
import { DemographicRow } from '../models/cohortData/DemographicDTO';
import { CohortComparisonResult, CohortData, CohortState, CohortStateType } from '../models/state/CohortState';

export function defaultCohortState(): CohortState {
    return { 
        data: {
            metadata: new Map(),
            patients: new Map(),
            comparison: {
                values: new Map(),
                n: 0
            }
        },
        search: {
            hints: [],
            term: ''
        },
        state: CohortStateType.NOT_LOADED
    };
}

const setCohortDatasets = (state: CohortState, data: CohortData) => {
    return Object.assign({}, state, { data });
};

const setComparisonDataset = (state: CohortState, comparison: CohortComparisonResult) => {
    return Object.assign({}, state, { data: { 
        ...state.data, 
        comparison
    } });
};

const setCohortState = (state: CohortState, cohortStateType: CohortStateType) => {
    return Object.assign({}, state, { state: cohortStateType });
};

const setSearchTerm = (state: CohortState, term: string) => {
    return Object.assign({}, state, { 
        search: { ...state.search, term }
    });
};

const setSearchHints = (state: CohortState, hints: DemographicRow[]) => {
    return Object.assign({}, state, { 
        search: { ...state.search, hints }
    });
};

const clearCohortDatasets = (state: CohortState) => {
    return Object.assign({}, state, {
        ...state,
        cohort: {
            patients: new Map()
        }
    });
};

export function cohort(state: CohortState = defaultCohortState(), action: CohortAction): CohortState {
    switch (action.type) {
        case SET_COHORT_DATASETS:
            return setCohortDatasets(state, action.cohort!);
        case SET_COHORT_STATE:
            return setCohortState(state, action.state!);
        case SET_SEARCH_TERM:
            return setSearchTerm(state, action.term!);
        case SET_SEARCH_HINTS:
            return setSearchHints(state, action.hints!);
        case SET_COMPARISON_DATASET:
            return setComparisonDataset(state, action.comparison!);
        default:
            return state;
    }
}
