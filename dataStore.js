const DEFAULT_DATA = {
  mainBg: {
    image: "" // Recommended size: 1920x1080
  },
  teaOfTheMonth: {
    name: "Milky Oolong",
    description: {
      country: "Taiwan",
      caffeine: "Caffeine", // string
      tasteNotes: ["Silky", "Milky", "Sweet"] // max 6
    },
    recipes: {
      hot: { active: true, amount: "300ml", temp: "98ºC", time: "4min", ice: false },
      iced: { active: true, amount: "150ml", temp: "98ºC", time: "4min", ice: true },
      coldbrew: { active: false, amount: "500ml", temp: "Room Temp", time: "12hrs", ice: true }
    },
    story: {
      title: "Texture of Mist",
      body: "Alishan Jin Xuan tea offers a dramatic inversion:\na naturally milky, velvety aroma developed to\nsurvive the 1,600m alpine freeze. Crisp at first,\ncomforting to the end."
    }
  },
  calendar: {
    events: [
      {
        date: "2026-07-15",
        title1: "Summer Tasting",
        title2: "",
        location: "Seoul Flagship",
        thumbnail: "NOTES_ON_WEB/_ASSETS/event_thumb_1.jpg"
      }
    ]
  },
  videoPlayer: {
    videoUrl: "NOTES_ON_WEB/_converts/landing_video.mp4",
    title: "The Art of Stillness"
  },
  productCards: [
    {
      id: "prod-1",
      active: true,
      type: "portrait", // portrait or landscape
      image: "NOTES_ON_WEB/_converts/product_card_preview.png",
      name: "Yame Sencha",
      origin: "Japan",
      badge: {
        active: true,
        text: "FEATURED",
        bgColor: "#000000",
        textColor: "#ffffff"
      },
      dynamicLabel: {
        title: "SEASONAL TEA :",
        productName: "MILKY OOLONG"
      }
    },
    {
      id: "prod-2",
      active: true,
      type: "landscape",
      image: "NOTES_ON_WEB/_converts/product_card_preview.png",
      name: "Yame Sencha (Land)",
      origin: "Japan",
      badge: {
        active: true,
        text: "FEATURED",
        bgColor: "#000000",
        textColor: "#ffffff"
      },
      dynamicLabel: {
        title: "SEASONAL TEA :",
        productName: "YAME SENCHA"
      }
    },
    {
      id: "prod-3",
      active: false,
      type: "portrait",
      image: "",
      name: "",
      origin: "",
      badge: {
        active: false,
        text: "NEW",
        bgColor: "#000000",
        textColor: "#ffffff"
      },
      dynamicLabel: {
        title: "",
        productName: ""
      }
    },
    {
      id: "prod-4",
      active: false,
      type: "landscape",
      image: "",
      name: "",
      origin: "",
      badge: {
        active: false,
        text: "NEW",
        bgColor: "#000000",
        textColor: "#ffffff"
      },
      dynamicLabel: {
        title: "",
        productName: ""
      }
    }
  ]
};

async function loadDataAsync() {
  try {
    const docRef = window.db.collection('noteson').doc('mainData');
    
    // Add a 5 second timeout in case Firestore hangs (e.g. bad connection, CORS, adblocker)
    const docSnap = await Promise.race([
      docRef.get(),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('Firebase connection timeout')), 5000))
    ]);
    
    if (docSnap.exists) {
      const data = docSnap.data();
      return { ...DEFAULT_DATA, ...data };
    } else {
      console.log("No such document in Firestore! Returning default data.");
      return DEFAULT_DATA;
    }
  } catch (e) {
    console.error("Failed to load data from Firestore", e);
    // Fallback to local storage if offline/error
    const dataStr = localStorage.getItem("noteson_admin_data");
    if (dataStr) {
      try { return { ...DEFAULT_DATA, ...JSON.parse(dataStr) }; } catch (e) {}
    }
    return DEFAULT_DATA;
  }
}

async function saveDataAsync(data) {
  try {
    const docRef = window.db.collection('noteson').doc('mainData');
    
    // Add timeout to prevent hanging on save
    await Promise.race([
      docRef.set(data),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('Firebase connection timeout during save')), 5000))
    ]);
    
    // Also save a backup locally
    localStorage.setItem("noteson_admin_data", JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data to Firestore", e);
    throw e; // re-throw so the caller knows it failed
  }
}

// Keeping synchronous versions for backwards compatibility if needed during transition, 
// though they should not be used for Cloud data.
function loadData() {
  console.warn("loadData() called synchronously! Use loadDataAsync() for cloud data.");
  const dataStr = localStorage.getItem("noteson_admin_data");
  if (dataStr) {
    try {
      const parsed = JSON.parse(dataStr);
      return { ...DEFAULT_DATA, ...parsed };
    } catch (e) {
      return DEFAULT_DATA;
    }
  }
  return DEFAULT_DATA;
}

function saveData(data) {
  console.warn("saveData() called synchronously! Use saveDataAsync() for cloud data.");
  localStorage.setItem("noteson_admin_data", JSON.stringify(data));
}

// Export for usage if module, else attach to window
window.notesOnDataStore = {
  loadData,
  saveData,
  loadDataAsync,
  saveDataAsync,
  DEFAULT_DATA
};
