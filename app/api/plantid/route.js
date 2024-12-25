import plantDataset from '@/data/plant_dataset.json'; // Adjust path

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const plantName = searchParams.get('name')?.toLowerCase();

  const plant = plantDataset.find((p) => p.name.toLowerCase() === plantName);

  if (plant) {
    console.log('Plant found:', plant); // Check if `scientific_name` and `fun_fact` are present
    const normalizedPlant = {
      name: plant.name,
      scientific_name: plant.scientific_name,
      fun_fact: plant.fun_fact,
      used_for: plant.used_for,
      category: plant.category,
      watering: plant.watering_guidelines,
      growing_conditions: plant.growing_conditions,
    };
    return new Response(JSON.stringify(normalizedPlant), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    console.log('Plant not found:', plantName); // Debug if the plant is not found
    return new Response(JSON.stringify({ error: 'Plant not found' }), {
      status: 404,
    });
  }
}
