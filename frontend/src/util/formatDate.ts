const formatDate = (dateString: string, language: string) => {

    const [year, month, day] = dateString.includes("T") ? dateString.split('T')[0].split('-') : dateString.split(' ')[0].split('-');
    if (language === "FIN") {
        return `${day} ${month} ${year}`;
    }
    return `${year} ${month} ${day}`;

};

const formatDateWithoutT = (dateString: string, language: string) => {

    const [year, month, day] = dateString.split('-');
        if (language === "FIN") {
        return `${day} ${month} ${year}`;
    }
    return `${year} ${month} ${day}`;

};

export {formatDate, formatDateWithoutT };