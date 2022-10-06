import React from 'react';
import { useParams } from 'react-router-dom';
import { CohortState, CohortStateType, PatientData } from '../../models/state/CohortState';
import { PatientPageConfig } from '../../models/config/config';
import PatientHeaderBar from '../../components/Patient/PatientHeaderBar/PatientHeaderBar';
import { renderDynamicComponent } from '../../utils/dynamic';
import { getCohortDatasets } from '../../actions/cohort';
import './Patient.css';
import { PatientId } from '../../models/patientList/Patient';

interface Props {
    cohortId?: string;
    cohort?: CohortState;
    config?: PatientPageConfig;
    patientId?: string;
    dispatch: any;
}

class Patient extends React.Component<Props> {
    private className = 'patient';

    public componentDidUpdate(prevProps: Props) {
        const { cohort, cohortId, dispatch } = this.props;

        if (cohortId && (cohort?.state === CohortStateType.NOT_LOADED || cohortId !== prevProps.cohortId)) {
            dispatch(getCohortDatasets(cohortId));
        }
    }

    public render() {
        const c = this.className;
        const { cohort, config, patientId, dispatch } = this.props;

        // Bail if no data
        if (!cohort || !config || !patientId) { return null; }
        var patient: PatientData | undefined;
        if (patientId.startsWith("subject-")) {
            const subjectId = patientId.substring(8);
            cohort.data.patients.forEach((value: PatientData, key: PatientId) => {
                if (subjectId === value?.demographics?.name) {
                    patient = value;
                }
            });
        } else {
            patient = cohort.data.patients.get(patientId);
        }

        // Bail if no patient - TODO(ndobb) should be 404
        if (!patient) { return null; }
        const thePatient = patient as PatientData;

        return (
            <div className={`${c}-container`}>

                {/* Name, age, search, etc. */}
                <PatientHeaderBar patient={patient} config={config} />

                {/* Dynamically read & render content */}
                <div className={`${c}-content-container`}>
                    {config.content.map((content, i) => renderDynamicComponent(content, cohort.data, thePatient, dispatch, i))}
                </div>
            </div>
        );
    }
};

const withRouter = (Patient: any) => (props: Props) => {
    const params = useParams();
    const { cohortId, patientId } = params;

    if ( !cohortId || !patientId || !props.cohort || !props.config) { return null; }

    return <Patient patientId={patientId} cohortId={cohortId} config={props.config} cohort={props.cohort} dispatch={props.dispatch} />;
};

export default withRouter(Patient);