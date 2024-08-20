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
        ChildRegiSuccess: `Child registration successfully`,
        ChildRegiRequired: `Name, Description, Gender, Birthdate, Nationality are required`,
        UserDelete: `계정이 비활성화 되었습니다, 6개월 이내에 접속시 재활성되며, 6개월간 비접속시, 모든 연관 정보는 삭제됩니다.`,
        HistoryRegiSuccess: `접종정보 저장 완료`,
        HistoryAlready: `해당 백신은 이미 접종하였습니다.`,
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

res.status(200).json({ message: 'User Inactivated, can activate again if login within 6months, all related data will get deleted after 6 months' });
return res.status(400).json({ message: 'Suspected to Attacking', userDeleteRes: 1 });
return res.status(403).json({ message: 'No Authority', userDeleteRes: 2 });

res.status(201).json({ message: 'Vaccination History Saved Successfully' });
return res.status(403).json({ message: 'No Authority', historyRegiRes: 1 });
return res.status(400).json({ message: 'Suspected to Attacking', historyRegiRes: 2 });
return res.status(400).json({ message: 'That vaccine is already dosed', historyRegiRes: 3 });

return res.status(403).json({ message: 'No Authority', historyRes: 1 });

return res.status(403).json({ message: 'No Authority', noticeRes: 1 });

*/