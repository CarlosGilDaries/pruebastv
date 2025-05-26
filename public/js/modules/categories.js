export async function categoriesData(api) {
    try {
        const response = await fetch(api + 'categories');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}