import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { AboutTranslations } from '../translation/About';
import {Container} from 'react-bootstrap';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const About = () => {

    const language = useSelector((state: RootState) => state.app.language);

    const translations = AboutTranslations[language];

    return (
        <Container className="center_ui">
            <div className={"main_top container"}>
                <p className={"history_title"}>{`${translations.title}`}</p>
            </div>

            <div>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <b>
                            {translations.source_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.source_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <b>
                            {translations.commercial_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.commercial_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel3-content"
                        id="panel3-header"
                    >
                        <b>
                            {translations.personal_info_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.personal_info_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel4-content"
                        id="panel4-header"
                    >
                        <b>
                            {translations.guide_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.guide_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel5-content"
                        id="panel5-header"
                    >
                        <b>
                            {translations.bbs_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.bbs_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel6-content"
                        id="panel6-header"
                    >
                        <b>
                            {translations.logout_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.logout_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel7-content"
                        id="panel7-header"
                    >
                        <b>
                            {translations.modify_data_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.modify_data_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel8-content"
                        id="panel8-header"
                    >
                        <b>
                            {translations.account_modify_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.account_modify_desc }} />
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel9-content"
                        id="panel9-header"
                    >
                        <b>
                            {translations.delete_account_title}
                        </b>
                    </AccordionSummary>
                    <AccordionDetails dangerouslySetInnerHTML={{ __html: translations.delete_account_desc }} />
                </Accordion>

            </div>


        </Container>
    );
};

export default About;