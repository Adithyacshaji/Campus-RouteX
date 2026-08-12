import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wwsdhwghsbrwgxjobnnd.supabase.co';
const supabaseAnonKey = 'sb_publishable_J0aGo2iR9-mR8DEIFMXzTw_H744R4N0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Inserting Administration department...');
  const { data: deptData, error: deptError } = await supabase
    .from('departments')
    .upsert([{ id: 8, name: 'Administration' }])
    .select();
  
  if (deptError) {
    console.error('Error inserting department:', deptError);
  } else {
    console.log('Inserted department:', deptData);
  }

  const facultiesToInsert = [
    {
      department_id: 6,
      name: 'VD Jhon',
      designation: 'Technical staff',
      room: 'chavara',
      floor: '1st Floor',
      building: 'chavara',
      has_indoor_navigation: false,
      route_node: 'chavara',
      indoor_node: 'chavara'
    },
    {
      department_id: 1,
      name: 'Salish P Louis',
      designation: 'Professor',
      room: 'Chavara 5th Floor',
      floor: '5th Floor',
      building: 'chavara',
      has_indoor_navigation: true,
      route_node: 'chavara',
      indoor_node: 'F501'
    },
    {
      department_id: 8,
      name: 'John V.D',
      designation: 'Administration',
      room: 'Principal Room',
      floor: 'G',
      building: 'stmarys',
      has_indoor_navigation: true,
      route_node: 'g',
      indoor_node: 'N314'
    },
    {
      department_id: 8,
      name: 'Sajeev John',
      designation: 'Administration',
      room: 'Office Room',
      floor: 'G',
      building: 'stmarys',
      has_indoor_navigation: true,
      route_node: 'g',
      indoor_node: 'N319'
    },
    {
      department_id: 8,
      name: 'Sijo M T',
      designation: 'Administration',
      room: 'Office Room',
      floor: 'G',
      building: 'stmarys',
      has_indoor_navigation: true,
      route_node: 'g',
      indoor_node: 'N319'
    }
  ];

  console.log('Inserting missing faculties...');
  const { data: facData, error: facError } = await supabase
    .from('faculties')
    .insert(facultiesToInsert)
    .select();

  if (facError) {
    console.error('Error inserting faculties:', facError);
  } else {
    console.log('Inserted faculties:', facData);
  }
}

run();
