/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortComparisonResult, CohortData } from '../models/state/CohortState';
import { DemographicRow } from '../models/cohortData/DemographicDTO';
import { PatientListDatasetDTO, PatientListDatasetQueryDTO } from '../models/patientList/Dataset';
import CohortDataWebWorker from '../providers/cohortData/cohortDataWebWorker';
import { WidgetTimelineComparisonEntryConfig } from '../models/config/content';
import { TimelineValueSet } from '../components/Dynamic/Timeline/Timeline';

const cohortDataProvider = new CohortDataWebWorker();

export const transform = async (
        datasets: [PatientListDatasetQueryDTO, PatientListDatasetDTO], 
        demographics: DemographicRow[])
    : Promise<CohortData> => {
    const transformed = await cohortDataProvider.transform(datasets, demographics);
    return transformed as CohortData;
};

export const getComparisonMeans = async (
    filters: WidgetTimelineComparisonEntryConfig[], 
    dimensions: TimelineValueSet[],
    sourcePatId: string) 
    : Promise<CohortComparisonResult> => {
    const values = await cohortDataProvider.getCohortMean(filters, dimensions, sourcePatId) as CohortComparisonResult;
    return values;
};
