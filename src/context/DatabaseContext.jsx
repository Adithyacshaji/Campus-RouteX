import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

// Static fallbacks
import { LOCATIONS as STATIC_LOCATIONS } from '../data/locations';
import { NODES as STATIC_NODES, EDGES as STATIC_EDGES } from '../data/graph';
import { INDOOR_NODES as STATIC_INDOOR_NODES } from '../data/indoorNodes';
import { INDOOR_EDGES as STATIC_INDOOR_EDGES } from '../data/indoorGraph';
import { CHAVARA_INDOOR_NODES as STATIC_CHAVARA_INDOOR_NODES } from '../data/chavaraIndoorNodes';
import { CHAVARA_INDOOR_EDGES as STATIC_CHAVARA_INDOOR_EDGES } from '../data/chavaraIndoorGraph';
import { QR_LOCATIONS as STATIC_QR_LOCATIONS } from '../data/qrLocations';
import { bottomSheetData as STATIC_BOTTOM_SHEET_DATA } from '../data/bottomSheetData';

const DatabaseContext = createContext(null);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(!isSupabaseConfigured);

  // States initialized with fallbacks
  const [locations, setLocations] = useState(STATIC_LOCATIONS);
  const [nodes, setNodes] = useState(STATIC_NODES);
  const [edges, setEdges] = useState(STATIC_EDGES);
  const [indoorNodes, setIndoorNodes] = useState(STATIC_INDOOR_NODES);
  const [indoorEdges, setIndoorEdges] = useState(STATIC_INDOOR_EDGES);
  const [chavaraIndoorNodes, setChavaraIndoorNodes] = useState(STATIC_CHAVARA_INDOOR_NODES);
  const [chavaraIndoorEdges, setChavaraIndoorEdges] = useState(STATIC_CHAVARA_INDOOR_EDGES);
  const [qrLocations, setQrLocations] = useState(STATIC_QR_LOCATIONS);
  const [bottomSheetData, setBottomSheetData] = useState(STATIC_BOTTOM_SHEET_DATA);
  const [dbRooms, setDbRooms] = useState([]);

  // Re-fetch individual tables to guarantee alignment with realtime updates
  const fetchLocations = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('locations').select('*');
    if (error) throw error;
    setLocations(data.map(loc => ({
      id: loc.id,
      name: loc.name,
      position: [loc.lat, loc.lng],
      routeNode: loc.route_node
    })));
  };

  const fetchOutdoorNodes = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('outdoor_nodes').select('*');
    if (error) throw error;
    const nodeObj = {};
    data.forEach(node => {
      nodeObj[node.id] = [node.lat, node.lng];
    });
    setNodes(nodeObj);
  };

  const fetchOutdoorEdges = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('outdoor_edges').select('source, target');
    if (error) throw error;
    setEdges(data.map(edge => [edge.source, edge.target]));
  };

  const fetchIndoorNodes = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('indoor_nodes').select('*');
    if (error) throw error;
    
    const stmarys = {};
    const chavara = {};
    
    data.forEach(node => {
      // Label comes ONLY from the DB — no static fallback
      const formatted = {
        floor: node.floor,
        position: [node.lat, node.lng],
        // Only set label if DB has a non-empty value
        ...(node.label ? { label: node.label } : {}),
        // Only set labelPosition if DB has explicit coordinates
        ...(node.label_lat != null && node.label_lng != null ? { labelPosition: [node.label_lat, node.label_lng] } : {})
      };
      
      if (node.building === 'stmarys') {
        const { label: _l, labelPosition: _lp, ...staticRest } = STATIC_INDOOR_NODES[node.id] || {};
        stmarys[node.id] = { 
          ...staticRest,   // position/floor/edges from static, but NO label
          ...formatted,    // DB values win; label only present if DB has it
        };
      } else {
        const { label: _l, labelPosition: _lp, ...staticRest } = STATIC_CHAVARA_INDOOR_NODES[node.id] || {};
        chavara[node.id] = {
          ...staticRest,
          id: node.id,
          ...formatted,
        };
      }
    });
    
    // Add static nodes that are NOT in the DB yet — strip labels so only DB controls them
    Object.keys(STATIC_INDOOR_NODES).forEach(id => {
      if (!stmarys[id]) {
        const { label: _l, labelPosition: _lp, ...rest } = STATIC_INDOOR_NODES[id];
        stmarys[id] = { id, ...rest };
      }
    });
    
    Object.keys(STATIC_CHAVARA_INDOOR_NODES).forEach(id => {
      if (!chavara[id]) {
        const { label: _l, labelPosition: _lp, ...rest } = STATIC_CHAVARA_INDOOR_NODES[id];
        chavara[id] = { id, ...rest };
      }
    });
    
    setIndoorNodes(stmarys);
    setChavaraIndoorNodes(chavara);
  };


  const fetchIndoorEdges = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('indoor_edges').select('building, source, target');
    if (error) throw error;
    
    const stmarys = [];
    const chavara = [];
    
    data.forEach(edge => {
      const pair = [edge.source, edge.target];
      const b = (edge.building || "").toLowerCase();
      if (b.includes('chavara')) {
        chavara.push(pair);
      } else {
        stmarys.push(pair);
      }
    });
    
    setIndoorEdges(stmarys);
    setChavaraIndoorEdges(chavara);
  };

  const fetchQrLocations = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('qr_locations').select('*');
    if (error) throw error;
    setQrLocations(data.map(qr => ({
      id: qr.id,
      name: qr.name,
      position: [qr.lat, qr.lng],
      startNode: qr.start_node,
      type: qr.type,
      ...(qr.floor ? { floor: qr.floor } : {}),
      ...(qr.building ? { building: qr.building } : {})
    })));
  };


  const fetchRooms = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) throw error;
    setDbRooms(data || []);
  };

  // Returns a sort rank so faculties appear in order: HOD → Deputy HOD → everyone else
  const getFacultyRank = (designation = '') => {
    const d = designation.toLowerCase();
    if (d.includes('hod') && !d.includes('deputy') && !d.includes('asst')) return 0;
    if (d.includes('deputy') || (d.includes('asst') && d.includes('hod'))) return 1;
    return 2;
  };

  const fetchBottomSheetData = async () => {
    if (!isSupabaseConfigured) return;
    const { data: depts, error: deptError } = await supabase.from('departments').select('*').order('name');
    if (deptError) throw deptError;
    const { data: facs, error: facError } = await supabase.from('faculties').select('*');
    if (facError) throw facError;
    
    const departments = depts.map(dept => {
      const faculties = facs
        .filter(f => f.department_id === dept.id)
        .map(f => ({
          name: f.name,
          designation: f.designation,
          room: f.room || undefined,
          floor: f.floor || undefined,
          building: f.building || undefined,
          hasIndoorNavigation: f.has_indoor_navigation,
          routeNode: f.route_node || undefined,
          indoorNode: f.indoor_node || undefined
        }))
        .sort((a, b) => {
          const rankDiff = getFacultyRank(a.designation) - getFacultyRank(b.designation);
          if (rankDiff !== 0) return rankDiff;
          return (a.name || '').localeCompare(b.name || '');  // alphabetical within same rank
        });
      return {
        id: dept.id,
        name: dept.name,
        faculties,
        building: dept.building || undefined,
        floor: dept.floor || undefined,
        room: dept.room || undefined,
        routeNode: dept.route_node || undefined,
        indoorNode: dept.indoor_node || undefined,
        hasIndoorNavigation: dept.has_indoor_navigation || false
      };
    });
    
    setBottomSheetData({
      ...STATIC_BOTTOM_SHEET_DATA,
      departments
    });
  };

  const loadAllData = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all([
        fetchLocations(),
        fetchOutdoorNodes(),
        fetchOutdoorEdges(),
        fetchIndoorNodes(),
        fetchIndoorEdges(),
        fetchQrLocations(),
        fetchBottomSheetData(),
        fetchRooms()
      ]);
      setUsingFallback(false);
    } catch (err) {
      console.error("Failed to load data from Supabase. Falling back to static data.", err);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    
    if (!isSupabaseConfigured) return;

    // Realtime channel subscriptions
    const sub = supabase.channel('supabase-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        fetchLocations().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outdoor_nodes' }, () => {
        fetchOutdoorNodes().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outdoor_edges' }, () => {
        fetchOutdoorEdges().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'indoor_nodes' }, () => {
        fetchIndoorNodes().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'indoor_edges' }, () => {
        fetchIndoorEdges().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qr_locations' }, () => {
        fetchQrLocations().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => {
        fetchBottomSheetData(),
        fetchRooms().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faculties' }, () => {
        fetchBottomSheetData(),
        fetchRooms().catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  // Compute SEARCH_ITEMS dynamically from state using useMemo (replaces searchData.js logic)
  const searchItems = useMemo(() => {
    const roomItems = [];

    // Rooms come exclusively from the `rooms` table in the database.
    // No static fallback — if the table is empty or still loading, no rooms are shown.
    dbRooms.forEach(room => {
      roomItems.push({
        id: room.room_id,
        name: room.name,
        type: "room",
        floor: room.floor,
        routeNode: room.route_node,
        building: room.building,
        ...(room.indoor_node ? { indoorNode: room.indoor_node } : {})
      });
    });

    const facultyItems = [];
    bottomSheetData.departments.forEach((department) => {
      department.faculties.forEach((faculty) => {
        facultyItems.push({
          id: faculty.name,
          name: faculty.name,
          type: "faculty",
          department: department.name,
          room: faculty.room || null,
          floor: faculty.floor || null,
          building: faculty.building || (faculty.room ? "stmarys" : "chavara"),
          routeNode: faculty.routeNode || (faculty.room ? "g" : "chavara"),
          indoorNode: faculty.indoorNode || (faculty.room ? faculty.room : "chavara"),
          designation: faculty.designation,
          locationType: faculty.room ? "ROOM" : "chavara",
        });
      });
    });

    return [
      ...locations,
      ...roomItems,
      ...facultyItems,
    ];
  }, [locations, bottomSheetData, dbRooms]);

  return (
    <DatabaseContext.Provider
      value={{
        loading,
        usingFallback,
        locations,
        nodes,
        edges,
        indoorNodes,
        indoorEdges,
        chavaraIndoorNodes,
        chavaraIndoorEdges,
        qrLocations,
        bottomSheetData,
        searchItems,
        reloadData: loadAllData
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
