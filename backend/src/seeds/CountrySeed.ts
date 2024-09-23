import { AppDataSource } from '../ormconfig';
import { Country } from '../entities/Country';

export const seedCountries = async () => {

    const countryRepository = AppDataSource.getRepository(Country);

    const countries = [
        {
            national_code: `FIN`,
            name_original: `Suomi`,
            name_english: `Finland`,

        },
        {
            national_code: `KOR`,
            name_original: `대한민국`,
            name_english: `Korea`,
        },
        {
            national_code: `USA`,
            name_original: `USA`,
            name_english: `USA`,
        },

    ];

    for (const country of countries) {
        const existingCountry = await countryRepository.findOne({
            where: {
                national_code: country.national_code,
                name_english: country.name_english,
                name_original: country.name_original,
            },
        });
        if (!existingCountry) {
            await countryRepository.save(country);
        }
    }

    console.log(`Country data seeded successfully`);
};
