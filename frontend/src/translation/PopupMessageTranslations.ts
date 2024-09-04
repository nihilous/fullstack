export const PopupMessageTranslations = {
    FIN: {
        injection: `Epäilyttävä toiminta havaittu.`,
        noAuthority: `Ei käyttöoikeutta.`,
        defaultError: `Sisäinen palvelinvirhe.`,
        JoinSuccess: `Käyttäjä rekisteröity onnistuneesti.`,
        JoinRequired: `Sähköposti, lempinimi ja salasana ovat pakollisia.`,
        JoinInvalid: `Virheellinen sähköpostimuoto.`,
        JoinExist: `Sähköposti tai lempinimi on jo käytössä.`,
        LoginSuccess: `Kirjautuminen onnistui.`,
        LoginRequired: `Sähköposti ja salasana ovat pakollisia.`,
        LoginInvalid: `Virheellinen sähköposti tai salasana.`,
        ChildRegiSuccess: `Lapsen rekisteröinti onnistui.`,
        ChildRegiRequired: `Nimi, kuvaus, sukupuoli, syntymäaika ja kansalaisuus ovat pakollisia.`,
        UserDelete: `Käyttäjä poistettu käytöstä, voit aktivoida tilin uudelleen kirjautumalla sisään 6 kuukauden sisällä. Kaikki tiedot poistetaan 6 kuukauden jälkeen.`,
        HistoryRegiSuccess: `Rokotushistoria tallennettu onnistuneesti.`,
        HistoryAlready: `Kyseinen rokote on jo annettu.`,
        AccountChangeInfoSuccess: `Käyttäjätiedot muutettu onnistuneesti.`,
        AccountChangePassSuccess: `Salasana vaihdettu onnistuneesti.`,
        AccountNoField: `Ei annettu päivitettäviä tietoja.`,
        AccountRequired: `Sähköposti, vanha salasana ja uusi salasana ovat pakollisia.`,
        AccountWrongEmail: `Virheellinen sähköpostiosoite.`,
        AccountWrongPass: `Virheellinen salasana.`,
        AdminJoinSuccess: `Admin-rekisteröinti onnistui.`,
        AdminJoinRequired: `Sähköposti, lempinimi, salasana ja admin-salasana ovat pakollisia.`,
        AdminJoinWrong: `Ei oikeutta luoda admin-tiliä.`,
        AdminJoinAlready: `Sähköpostiosoite on jo käytössä.`,
        delete_success: `Lapsen tiedot poistettu onnistuneesti.`,
        delete_child_record_success: `Lapsen tiedot ja rokotushistoria poistettu onnistuneesti.`,
        delete_already: `Ei enää poistettavaa tietoa.`,
        update_history_record_zero: `Päivitetty rokotustieto 0`,
        update_history_record_success: `Rokotushistoria päivitetty onnistuneesti.`,
        deleted_history_record_zero: `Poistettu rokotustieto 0`,
        delete_history_record_success: `Rokotushistoria poistettu onnistuneesti.`,
        update_child_record_success: `Lapsen tiedot päivitetty onnistuneesti.`,
        BoardWriteRequire: `Otsikko ja teksti ovat pakollisia.`,
        BoardPostingSuccess: `Käyttäjän viesti rekisteröity onnistuneesti.`,
        BoardDeletePostSuccess: `Viesti poistettu.`,
        BoardDeletePostReplySuccess: `Viesti poistettu, poistettu vastaus.`,
        BoardDeleteReplySuccess: `Vastaus poistettu.`,
        BoardDeleteAlready: `Jo poistettu.`,
    },
    ENG: {
        injection: `Suspected to Attacking.`,
        noAuthority: `No Authority.`,
        defaultError: `Internal Server Error.`,
        JoinSuccess: `User registered successfully`,
        JoinRequired: `Email, nickname and password are required.`,
        JoinInvalid: `Invalid email format.`,
        JoinExist: `Email or Nickname is already in use.`,
        LoginSuccess: `Login success.`,
        LoginRequired: `Email and password are required.`,
        LoginInvalid: `Invalid email or password.`,
        ChildRegiSuccess: `Child registration successfully.`,
        ChildRegiRequired: `Name, Description, Gender, Birthdate, Nationality are required.`,
        UserDelete: `User Inactivated, can activate again if login within 6months, all related data will get deleted after 6 months.`,
        HistoryRegiSuccess: `Vaccination History Saved Successfully`,
        HistoryAlready: `That vaccine is already dosed.`,
        AccountChangeInfoSuccess: `User info changed.`,
        AccountChangePassSuccess: `Password changed.`,
        AccountNoField:`No valid fields to change.`,
        AccountRequired: `Email, old password and new password are required.`,
        AccountWrongEmail: `Invalid Email.`,
        AccountWrongPass: `Invalid Password.`,
        AdminJoinSuccess: `Admin registered successfully.`,
        AdminJoinRequired: `Email, nickname and password and admin secret are required.`,
        AdminJoinWrong: `Not authorized to make admin account.`,
        AdminJoinAlready: `Email is already in use.`,
        delete_success: `Child Data Deleted Successfully.`,
        delete_child_record_success: `Child Data Deleted Successfully, Deleted Vaccination History `,
        delete_already: `No Data To Delete Any More.`,
        update_history_record_zero: `Updated Vaccination Record 0`,
        update_history_record_success: `Updated Vaccination History`,
        deleted_history_record_zero: `Deleted Vaccination Record 0`,
        delete_history_record_success: `Deleted Vaccination History`,
        update_child_record_success: `Child Information Updated.`,
        BoardWriteRequire: `Title and Text are required`,
        BoardPostingSuccess: `User Post Registered`,
        BoardDeletePostSuccess: `Post Deleted`,
        BoardDeletePostReplySuccess: `Post Deleted, Deleted Reply `,
        BoardDeleteReplySuccess: `Reply Deleted`,
        BoardDeleteAlready: `Already Deleted`,

    },
    KOR: {
        injection: `네트워크 공격이 의심됩니다.`,
        noAuthority: `권한이 없습니다.`,
        defaultError: `서버 에러.`,
        JoinSuccess: `계정이 생성되었습니다.`,
        JoinRequired: `이메일, 닉네임, 비밀번호가 필요합니다.`,
        JoinInvalid: `잘못된 이메일 형식입니다.`,
        JoinExist: `이메일이나 닉네임이 이미 사용되고있습니다.`,
        LoginSuccess: `로그인 성공.`,
        LoginRequired: `이메일과 비밀번호가 필요합니다.`,
        LoginInvalid: `이메일 혹은 비밀번호가 잘못되었습니다.`,
        ChildRegiSuccess: `아동 정보 등록 완료.`,
        ChildRegiRequired: `이름, 특이사항, 성별, 생년월일, 국적 정보가 필요합니다.`,
        UserDelete: `계정이 비활성화 되었습니다, 6개월 이내에 접속시 재활성되며, 6개월간 비접속시, 모든 연관 정보는 삭제됩니다.`,
        HistoryRegiSuccess: `접종정보 저장 완료.`,
        HistoryAlready: `해당 백신은 이미 접종하였습니다.`,
        AccountChangeInfoSuccess: `계정 정보 변경 완료.`,
        AccountChangePassSuccess: `비밀번호 변경 완료.`,
        AccountNoField:`변경 할 정보가 제공되지 않았습니다.`,
        AccountRequired: `이메일, 이전 비밀번호, 신규 비밀번호가 필요합니다.`,
        AccountWrongEmail: `이메일 주소가 잘못되었습니다.`,
        AccountWrongPass: `잘못된 비밀번호입니다.`,
        AdminJoinSuccess: `관리자 계정 생성 성공.`,
        AdminJoinRequired: `이메일, 닉네임, 비밀번호, 관리자키가 필요합니다.`,
        AdminJoinWrong: `승인되지 않은 관리자 계정 생성입니다.`,
        AdminJoinAlready: `이미 사용중인 이메일입니다.`,
        delete_success: `아동 정보 삭제 성공`,
        delete_child_record_success: `아동 정보 삭제 성공, 삭제된 백신 접종 기록 `,
        delete_already: `이미 삭제 되었습니다.`,
        update_history_record_zero: `변경된 백신 접종 기록 0건`,
        update_history_record_success: `백신 접종 기록 변경 완료되었습니다.`,
        deleted_history_record_zero: `삭제된 백신 접종 기록 0건`,
        delete_history_record_success: `백신 접종 정보 삭제 완료되었습니다.`,
        update_child_record_success: `아동 정보 변경 완료되었습니다.`,
        BoardWriteRequire: `제목과 내용이 필요합니다.`,
        BoardPostingSuccess: `글 게시 완료.`,
        BoardDeletePostSuccess: `글 삭제 완료.`,
        BoardDeletePostReplySuccess: `글 삭제 완료, 삭제된 댓글 `,
        BoardDeleteReplySuccess: `댓글 삭제 완료.`,
        BoardDeleteAlready: `이미 삭제되었습니다.`,
    }
};