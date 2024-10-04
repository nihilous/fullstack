import {formatDate} from "../../util/formatDate";
import {Button} from "react-bootstrap";
import React from "react";
import {UserDetailProperty} from "../../types/MainType"

interface ChildInformationProp {
    language: string;
    translations: any;
    info: UserDetailProperty[];

}

const ChildInformation = (props: ChildInformationProp) => {

    const language = props.language;
    const translations = props.translations;
    const info = props.info;

    return (
        <>
            {
                info.map(child => {

                    return (
                        <div key={child.id} className="child-info main_info_elem">
                            <div className={"mie_info_wrapper"}>
                                <div className={"mie_info"}>
                                    <span>{`${translations.child_name}`}</span>
                                    <span>{`${child.name}`}</span>
                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.child_birthdate}`}</span>
                                    <span>{formatDate(child.birthdate as string, language)}</span>
                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.child_gender}`}</span>
                                    <span>{`${child.gender === 0 ? translations.boy : translations.girl}`}</span>
                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.child_nationality}`}</span>
                                    <span>{`${child.name_original}`}</span>
                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.child_description}`}</span>
                                    <span>{`${child.description}`}</span>
                                </div>
                            </div>
                            <div className={"mie_button_wrapper"}>
                                <Button href={`/history/${child.id}`} className="btn btn-primary mie_button">
                                    {`${translations.history}`}
                                </Button>
                                <Button href={`/notice/${child.id}`} className="btn btn-primary mie_button">
                                    {`${translations.schedule}`}
                                </Button>
                                <div className={"clear"}></div>
                            </div>
                        </div>
                    );
                })
            }
        </>
    )
};

export default ChildInformation;