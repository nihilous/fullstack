import {formatDate} from "../../util/formatDate";
import {Button} from "react-bootstrap";
import React from "react";
import UserDetailProperty from "../../types/RegisterChildType";

interface ShowingChildInfoProp {
    language: string;
    translations: any;
    children: UserDetailProperty[];
}

const ShowingChildInfo = (props: ShowingChildInfoProp) => {

    const language = props.language;
    const translations = props.translations;
    const children = props.children;

    return (
        <>
            {
                children.map((child) => {

                    return (

                        <div key={child.id} className="child-info cr_info_elem">
                            <div className={"mie_info_wrapper"}>
                                <div className={"mie_info"}>
                                    <span>{`${translations.name}`}</span>
                                    <span>{`${child.name}`}</span>
                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.birthdate}`}</span>
                                    <span>{formatDate(child.birthdate as string, language)}</span>
                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.gender}`}</span>
                                    <span>{`${child.gender === 0 ? translations.boy : translations.girl}`}</span>

                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.nationality}`}</span>
                                    <span>{`${child.name_original}`}</span>

                                </div>
                                <div className={"mie_info"}>
                                    <span>{`${translations.description}`}</span>
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

export default ShowingChildInfo;