import {formatDate} from "../../util/formatDate";
import {Button} from "react-bootstrap";
import React from "react";
import {AdminMainUserInformation} from "../../types/AdminMainType";

interface AdminMainUserInformationProps {
    visibleChildren: {[key: number]: boolean};
    toggleChildrenVisibility: Function;
    language: string;
    translations: any;
    info: AdminMainUserInformation;
}

const MainUserElems = (props: AdminMainUserInformationProps) => {


    const language = props.language;
    const translations = props.translations;
    const visibleChildren = props.visibleChildren;
    const toggleChildrenVisibility = props.toggleChildrenVisibility;
    const info = props.info;


    return (
        <>
            <div className={"admin_main_category"}>
                {`${translations.regular} ${info.regular.length} ${translations.count_people}`}
            </div>
            <div>
                {info.regular.map(user => (


                    <div key={user.id} className={"am_parent"}>
                        <div className={"amp_info_wrap"}>
                            <div className={"amp_info"}>
                                <div>
                                    <span>{translations.user_id}</span>
                                    <span>{user.id}</span>
                                </div>
                                <div>
                                    <span>{translations.email}</span>
                                    <span>{user.email}</span>
                                </div>
                                <div>
                                    <span>{translations.nickname}</span>
                                    <span>{user.nickname}</span>
                                </div>
                                <div>
                                    <span>{translations.join_date}</span>
                                    <span>{formatDate(user.created_at, language)}</span>
                                </div>
                                <div>
                                    <span>{translations.last_login}</span>
                                    <span>{user.last_login === null ? translations.login_date_null : formatDate(user.last_login, language)}</span>
                                </div>
                                <div>
                                    <span>{translations.is_hibernate}</span>
                                    <span>{user.is_active === 1 ? translations.active : translations.deactivated}</span>
                                </div>
                                <div>
                                    <span>{translations.registered_children}</span>
                                    <span>{`${user.children.length} ${translations.count_people}`}</span>
                                </div>
                                <div>
                                    <span>{translations.post_wrote}</span>
                                    <span>{user.post_count}</span>
                                </div>
                                <div>
                                    <span>{translations.reply_wrote}</span>
                                    <span>{user.reply_count}</span>
                                </div>
                            </div>
                            <div className={"amp_button"}>
                                <Button onClick={() => toggleChildrenVisibility(user.id)}>
                                    {visibleChildren[user.id] ? translations.fold : translations.watch}
                                </Button>
                            </div>

                        </div>


                        <div className={`${visibleChildren[user.id] ? "am_children_wrap" : null}`}>
                            {visibleChildren[user.id] && user.children.map(child => {


                                return (
                                    <div key={"child" + child.detail_id} className={"am_child"}>
                                        <div>
                                            <span>{translations.child_id}</span>
                                            <span>{child.detail_id}</span>
                                        </div>
                                        <div>
                                            <span>{translations.child_name}</span>
                                            <span>{child.name}</span>
                                        </div>
                                        <div>
                                            <span>{translations.child_birthdate}</span>
                                            <span>{formatDate(child.birthdate, language)}</span>
                                        </div>
                                        <div>
                                            <span>{translations.child_gender}</span>
                                            <span>{`${child.gender === 0 ? translations.boy : translations.girl}`}</span>
                                        </div>
                                        <div>
                                            <span>{translations.child_nationality}</span>
                                            <span>{child.name_original}</span>
                                        </div>
                                        <div>
                                            <span>{translations.child_description}</span>
                                            <span>{child.description}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                ))}
            </div>

            <div className={"admin_main_category"}>
                {`${translations.join_only} ${info.joinonly.length} ${translations.count_people}`}
            </div>
            <div>
                {info.joinonly.map(user => (
                    <div key={user.id} className={"am_parent"}>
                        <div className={"amp_info_wrap"}>
                            <div className={"amp_info join_only"}>
                                <div>
                                    <span>{translations.user_id}</span>
                                    <span>{user.id}</span>
                                </div>
                                <div>
                                    <span>{translations.email}</span>
                                    <span>{user.email}</span>
                                </div>
                                <div>
                                    <span>{translations.nickname}</span>
                                    <span>{user.nickname}</span>
                                </div>
                                <div>
                                    <span>{translations.join_date}</span>
                                    <span>{formatDate(user.created_at, language)}</span>
                                </div>
                                <div>
                                    <span>{translations.last_login}</span>
                                    <span>{user.last_login === null ? translations.login_date_null : formatDate(user.last_login, language)}</span>
                                </div>
                                <div>
                                    <span>{translations.is_hibernate}</span>
                                    <span>{user.is_active === 1 ? translations.active : translations.deactivated}</span>
                                </div>
                                <div>
                                    <span>{translations.post_wrote}</span>
                                    <span>{user.post_count}</span>
                                </div>
                                <div>
                                    <span>{translations.reply_wrote}</span>
                                    <span>{user.reply_count}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </>
    );
};

export default MainUserElems;