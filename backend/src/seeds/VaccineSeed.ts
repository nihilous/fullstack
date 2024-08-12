import { AppDataSource } from '../ormconfig';
import { Vaccine } from '../entities/Vaccine';

export const seedVaccines = async () => {

    const vaccineRepository = AppDataSource.getRepository(Vaccine);

    const vaccines = [
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Rotavirus`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 2,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `Rotavirus vaccine`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Pneumokokkitaudit (PCV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 3,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `Aivokalvontulehdus, keuhkokuume, verenmyrkytys ja korvatulehdus`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Viitosrokote (DTP-IPV-Hib)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 3,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `Kurkkumätä, jäykkäkouristus, hinkuyskä, polio ja Hib-taudit, kuten aivokalvontulehdus, kurkunkannen tulehdus ja verenmyrkytys`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Rotavirus`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 3,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `Seasonal influenza vaccine`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Pneumokokkitaudit (PCV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 5,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `Aivokalvontulehdus, keuhkokuume, verenmyrkytys ja korvatulehdus`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Viitosrokote (DTP-IPV-Hib)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 5,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `Kurkkumätä, jäykkäkouristus, hinkuyskä, polio ja Hib-taudit, kuten aivokalvontulehdus, kurkunkannen tulehdus ja verenmyrkytys`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Rotavirus`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 5,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `Rotavirus vaccine`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kausi-influenssa`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `vuosittain`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Pneumokokkitaudit (PCV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 12,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `Aivokalvontulehdus, keuhkokuume, verenmyrkytys ja korvatulehdus`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Viitosrokote (DTP-IPV-Hib)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 12,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `Kurkkumätä, jäykkäkouristus, hinkuyskä, polio ja Hib-taudit, kuten aivokalvontulehdus, kurkunkannen tulehdus ja verenmyrkytys`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Tuhkarokko, sikotauti, vihurirokko (MPR)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 12,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 18,
            vaccine_round: 1,
            vaccine_description: `Kurkkumätä, jäykkäkouristus, hinkuyskä, polio ja Hib-taudit, kuten aivokalvontulehdus, kurkunkannen tulehdus ja verenmyrkytys`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kausi-influenssa`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 1,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `vuosittain`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Vesirokko`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 18,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 11,
            vaccine_round: 2,
            vaccine_description: `Vesirokko vaccine`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kausi-influenssa`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 2,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `vuosittain`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kausi-influenssa`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 3,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 4,
            vaccine_description: `vuosittain`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kausi-influenssa`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 5,
            vaccine_description: `vuosittain`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Nelosrokote (DTaP-IPV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `Kurkkumätä, jäykkäkouristus, hinkuyskä, polio`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kausi-influenssa`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 5,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 6,
            vaccine_description: `vuosittain`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kausi-influenssa`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 7,
            vaccine_description: `vuosittain`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Tuhkarokko, sikotauti, vihurirokko, vesirokko (MPRV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `MPRV vaccine`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `HPV-infektiot`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 10,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 12,
            vaccine_round: 1,
            vaccine_description: `HPV-infektiot vaccine`,
        },
        {
            vaccine_national_code: `FIN`,
            vaccine_name: `Kurkkumätä, jäykkäkouristus, hinkuyskä (dtap-tehoste)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 14,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 15,
            vaccine_round: 1,
            vaccine_description: `dtap-tehoste vaccine`,
        },

        {
            vaccine_national_code: `KOR`,
            vaccine_name: `B형 간염 (HepB)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 0,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 백신 브랜드에 따라 최소 3회 용량의 B형 간염 백신을 투여해야 합니다. 첫 번째 접종은 출생 시, 두 번째 접종은 1~2개월째, 마지막 접종은 6~18개월째에 투여합니다.`,
        },

        {
            vaccine_national_code: `KOR`,
            vaccine_name: `수막구균 (MenACWY, MenB)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 0,
            vaccine_maximum_period_type: 'y',
            vaccine_maximum_recommend_date: 10,
            vaccine_round: 1,
            vaccine_description: `특정 건강 상태(예: 비장 기능 이상)의 0~10세 사이의 영아와 아동은 MenACWY 백신, 또는 10세의 경우, MenACWY 및 MenB 백신을 접종해야 합니다. 담당 의료인과 상의하여 귀 자녀에게 뇌막염 예방 접종이 필요한지 확인하십시오.`,
        },

        {
            vaccine_national_code: `KOR`,
            vaccine_name: `호흡기 세포융합 바이러스 예방적 항체 (RSV-mAb)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 0,
            vaccine_maximum_period_type: 'm',
            vaccine_maximum_recommend_date: 7,
            vaccine_round: 1,
            vaccine_description: `10월부터 3월까지, 임신 기간 동안 RSV 백신을 접종하지 않은 경우, 생후 7개월까지의 영아에게 RSV 예방적 항체(RSV-mAb)가 필요할 수 있습니다. 일부 위험이 높은 생후 8~19개월의 영아는 두 번째 RSV철 동안 RSV-mAb가 필요할 수 있습니다.`,
        },

        {
            vaccine_national_code: `KOR`,
            vaccine_name: `B형 간염 (HepB)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 1,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 2,
            vaccine_round: 2,
            vaccine_description: `B형 간염 (HepB) 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `로타바이러스 (RV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 2,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 백신 브랜드에 따라 2~3회 용량의 로타바이러스 백신(RV)을 투여해야 합니다. 첫 번째 접종은 2개월 차에, 두 번째는 4개월 차에, 세 번째(필요한 경우)는 6개월 차에 투여합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `소아마비 (IPV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 2,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `소아를 마비성 소아마비로부터 보호하기 위해 4회 용량의 소아마비 백신(IPV)이 필요합니다. 첫 번째 접종은 2개월 차에, 두 번째는 4개월 차, 세 번째는 6~18개월 차에, 그리고 네 번째는 4~6세에 투여합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `폐렴구균 (접합 백신[PCV], 다당류 백신 [PPSV23])`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 2,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 접합 백신(PCV)을 4회 접종해야 합니다. 2개월 차에 첫 번째 용량을 투여하고, 4개월 차에 두 번째, 6개월 차에 세 번째, 그리고 12~15개월 차에 네 번째 용량을 투여합니다. 특정 건강 상태가 있는 일부 고연령 소아는 추가 폐렴구균 예방접종도 필요합니다. 귀 자녀에게 폐렴구균 질환에 대한 추가 보호 조치가 필요한지 귀 자녀의 담당 의료서비스 제공자에게 물어 보십시오`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `헤모필루스 인플루엔자 b형 (Hib)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 2,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 백신 브랜드에 따라 3~4회 용량의 Hib 백신을 투여해야 합니다. 첫 번째 접종은 2개월 차, 두 번째는 4개월 차, 세 번째는 6개월 차(필요한 경우)에, 그리고 마지막은 12~15개월 차에 투여합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 2,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 5회 용량의 DTaP 백신을 투여해야 합니다. 첫 번째 접종은 2개월 차에, 두 번째는 4개월 차, 세 번째는 6개월 차, 네 번째는 15~18개월 차에, 그리고 다섯 번째는 4~6세에 투여합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `로타바이러스 (RV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `로타바이러스 백신(RV) 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `소아마비 (IPV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `소아마비 백신(IPV) 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `폐렴구균 (접합 백신[PCV], 다당류 백신 [PPSV23])`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `폐렴구균 접합 백신(PCV) 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `헤모필루스 인플루엔자 b형 (Hib)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `헤모필루스 인플루엔자 b형 (Hib) 백신 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP) 백신 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `B형 간염 (HepB)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 18,
            vaccine_round: 3,
            vaccine_description: `B형 간염 (HepB) 3차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `로타바이러스 (RV)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `로타바이러스 백신(RV) 3차(필요한 경우)`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `소아마비 (IPV)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 18,
            vaccine_round: 2,
            vaccine_description: `소아마비 백신(IPV) 3차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `폐렴구균 (접합 백신[PCV], 다당류 백신 [PPSV23])`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `폐렴구균 접합 백신(PCV) 3차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `헤모필루스 인플루엔자 b형 (Hib)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `헤모필루스 인플루엔자 b형 (Hib) 백신 3차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP) 백신 3차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `코로나-19 (COVID-19)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `6개월 이상의 사람들은 누구나 현행 CDC 권고사항에 따라 코로나-19 백신을 필요로 합니다. 이 백신은 소아에서 발생할 수 있는 코로나-19의 드물지만 중대한 합병증을 예방합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 6,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `6개월 이상인 아이는 누구나 가을이나 겨울에 인플루엔자 백신을 접종해야 합니다. 9세 미만의 몇몇 아동은 2회 접종해야 합니다. 귀 자녀가 1회 넘게 용량을 접종을 받아야 하는지는 귀 자녀의 담당 의료인에게 물어 보십시오.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `A형 간염 (HepA)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 1,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 2회 용량의 A형 간염 백신을 투여해야 합니다. 첫 번째 접종은 1세에, 그리고 두 번째는 6~18개월 이후에 투여합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `폐렴구균 (접합 백신[PCV], 다당류 백신 [PPSV23])`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 12,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 15,
            vaccine_round: 4,
            vaccine_description: `폐렴구균 접합 백신(PCV) 4차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `헤모필루스 인플루엔자 b형 (Hib)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 12,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 15,
            vaccine_round: 4,
            vaccine_description: `헤모필루스 인플루엔자 b형 (Hib) 백신 4차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `수두 (Varicella Var)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 12,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 15,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 2회 용량의 수두 백신을 투여해야 합니다. 첫 번째 접종은 12~15개월 차에 투여하고, 두 번째는 4~6세에 투여합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `홍역, 볼거리, 풍진 (MMR)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 12,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 15,
            vaccine_round: 1,
            vaccine_description: `귀 자녀는 2회 용량의 MMR 백신을 투여해야 합니다. 첫 번째 접종은 12~15개월 차에 투여하고, 두 번째는 4~6세에 투여합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 15,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 18,
            vaccine_round: 4,
            vaccine_description: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP) 백신 4차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `A형 간염 (HepA)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 18,
            vaccine_maximum_period_type: `M`,
            vaccine_maximum_recommend_date: 30,
            vaccine_round: 2,
            vaccine_description: `A형 간염 (HepA) 백신 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 18,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 2,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 30,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 3,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 42,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 4,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `소아마비 (IPV)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 6,
            vaccine_round: 2,
            vaccine_description: `소아마비 백신(IPV) 4차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 6,
            vaccine_round: 5,
            vaccine_description: `디프테리아, 파상풍(개구장애) 및 백일기침 (백일해 DtaP) 백신 5차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `수두 (Varicella Var)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 6,
            vaccine_round: 2,
            vaccine_description: `수두 (Varicella Var) 백신 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `홍역, 볼거리, 풍진 (MMR)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 4,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 6,
            vaccine_round: 2,
            vaccine_description: `홍역, 볼거리, 풍진 (MMR) 백신 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 54,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 5,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 66,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 6,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 78,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 7,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 90,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 8,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 102,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 9,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인유두종 바이러스 (HPV)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `Y`,
            vaccine_minimum_recommend_date: 9,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 12,
            vaccine_round: 1,
            vaccine_description: `HPV 백신은 보통 11세 또는 12세 아동이 접종하지만 9세에 시작할 수 있습니다. 이는 2회 투여 시리즈로, 6~12개월 간격을 두어야 합니다.`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인유두종 바이러스 (HPV)`,
            vaccine_is_periodical: true,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 114,
            vaccine_maximum_period_type: `Y`,
            vaccine_maximum_recommend_date: 13,
            vaccine_round: 2,
            vaccine_description: `인유두종 바이러스 (HPV) 2차`,
        },
        {
            vaccine_national_code: `KOR`,
            vaccine_name: `인플루엔자 (독감)`,
            vaccine_is_periodical: false,
            vaccine_minimum_period_type: `M`,
            vaccine_minimum_recommend_date: 114,
            vaccine_maximum_period_type: null,
            vaccine_maximum_recommend_date: null,
            vaccine_round: 10,
            vaccine_description: `인플루엔자 (독감) 백신 매해 가을겨울`,
        },

    ];

    for (const vaccine of vaccines) {
        const existingVaccine = await vaccineRepository.findOne({
            where: {
                vaccine_name: vaccine.vaccine_name,
                vaccine_round: vaccine.vaccine_round,
            },
        });
        if (!existingVaccine) {
            await vaccineRepository.save(vaccine);
        }
    }

    console.log(`Vaccine data seeded successfully`);
};
