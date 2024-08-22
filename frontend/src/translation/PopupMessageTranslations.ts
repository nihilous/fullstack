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
        AdminJoinAlready: `Sähköpostiosoite on jo käytössä.`
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
        AdminJoinAlready: `이미 사용중인 이메일입니다.`
    }
};


/*
res.status(201).json({ message: 'User registered successfully' }); V
return res.status(400).json({ message: 'Suspected to Attacking', joinRes: 1 }); V
return res.status(400).json({ message: 'Email, nickname and password are required', joinRes: 2 }); V
return res.status(400).json({ message: 'Invalid email format', joinRes: 3 }); V
return res.status(400).json({ message: 'Email or Nickname is already in use', joinRes: 4 }); V

res.status(200).json({ message: 'Login success', token }); pass
return res.status(400).json({ message: 'Suspected to Attacking', loginRes: 1 }); V
return res.status(400).json({ message: 'Email and password are required', loginRes: 2 }); V
return res.status(400).json({ message: 'Invalid email or password', loginRes: 3 }); V

res.status(201).json({ message: 'User detail successfully added', token: newToken }); V
return res.status(400).json({ message: 'name, description, gender, birthdate, nationality are required', childRes: 1}); V
return res.status(400).json({ message: 'Suspected to Attacking', childRes: 2}); V
return res.status(403).json({ message: 'No Authority', childRes: 3}); V

관리자 전체 유저 정보
return res.status(403).json({ message: 'No Authority', adminUserRes: 1});

유저 1인 정보
return res.status(403).json({ message: 'No Authority', UserRes: 1 }); V



res.status(201).json({ message: 'Vaccination History Saved Successfully' }); V
return res.status(403).json({ message: 'No Authority', historyRegiRes: 1 }); V
return res.status(400).json({ message: 'Suspected to Attacking', historyRegiRes: 2 }); V
return res.status(400).json({ message: 'That vaccine is already dosed', historyRegiRes: 3 }); V

return res.status(403).json({ message: 'No Authority', historyRes: 1 }); V

return res.status(403).json({ message: 'No Authority', noticeRes: 1 }); V


res.status(201).json({ message: 'User info changed'}); v
return res.status(400).json({ message: 'Suspected to Attacking', userChangeInfo: 1 }); v
return res.status(403).json({ message: 'No Authority', userChangeInfo: 2 }); v
return res.status(400).json({ message: 'No valid fields to update', userChangeInfo: 3 }); v
return res.status(400).json({ message: 'Email or Nickname is already in use', userChangeInfo: 4 }); v

res.status(201).json({ message: 'Password changed'}); v
return res.status(400).json({ message: 'Suspected to Attacking', userNewPass: 1 }); v
return res.status(400).json({ message: 'Email, old password and new password are required', userNewPass: 2 }); v
return res.status(400).json({ message: 'Invalid email', userNewPass: 3 }); v
return res.status(400).json({ message: 'Invalid password', userNewPass: 4 }); v

res.status(200).json({ message: 'User Inactivated, can activate again if login within 6months, all related data will get deleted after 6 months' }); v
return res.status(400).json({ message: 'Suspected to Attacking', userDeleteRes: 1 }); v
return res.status(403).json({ message: 'No Authority', userDeleteRes: 2 }); v


res.status(201).json({ message: 'Admin registered successfully' });
return res.status(400).json({ message: 'Suspected to Attacking', adminJoinRes: 1 });
return res.status(400).json({ message: 'Email, nickname and password and admin secret are required', adminJoinRes: 2 });
return res.status(400).json({ message: 'Not authorized to make admin account', adminJoinRes: 3 });
return res.status(400).json({ message: 'Invalid email format', adminJoinRes: 4 });
return res.status(400).json({ message: 'Email is already in use', adminJoinRes: 5 });

*/