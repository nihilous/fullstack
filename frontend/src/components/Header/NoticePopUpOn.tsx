import {setNoticePopUp} from "../../redux/slice";
import React from "react";
import {Dispatch} from "redux";
import NoticePopUp from "../../types/NoticePopUpType";

interface WritePostUIProps {
    dispatch: Dispatch<any>;
    notice_popup: NoticePopUp;
}

const NoticePopUpOn = (props: WritePostUIProps) => {

    const dispatch = props.dispatch;
    const notice_popup = props.notice_popup;

    const clearing = () => {
        dispatch(setNoticePopUp({ on: false, is_error: null, message: '' }));
    };

    setTimeout(clearing, 3000);

    return (
        <div className="header_pop_up_wrap">
            <div className={`${notice_popup.is_error ? 'header_pop_up hpu_error' : 'header_pop_up hpu_inst'}`}>
                {`${notice_popup.message}`}
            </div>
        </div>
    );
};

export default NoticePopUpOn;