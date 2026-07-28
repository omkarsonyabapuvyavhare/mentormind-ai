"use client";



import { Suspense, useEffect, useState } from "react";

import { usePresenterModeBootstrap } from "@/hooks/use-presenter-mode";

import { useAppStore } from "@/stores/use-app-store";



function PresenterModeInitializer() {

  usePresenterModeBootstrap();

  return null;

}


function markProviderReady(setReady: (value: boolean) => void) {

  const query =

    typeof window !== "undefined" && window.location.search

      ? window.location.search

      : undefined;



  useAppStore.getState().syncPresenterMode(query, "provider-ready");

  setReady(true);

}



export function AppStoreProvider({ children }: { children: React.ReactNode }) {

  const [ready, setReady] = useState(false);



  useEffect(() => {

    const persist = useAppStore.persist;



    if (!persist) {

      markProviderReady(setReady);

      return;

    }



    if (persist.hasHydrated()) {

      markProviderReady(setReady);

      return;

    }



    const unsubscribe = persist.onFinishHydration(() => {

      markProviderReady(setReady);

    });



    void persist.rehydrate();



    return unsubscribe;

  }, []);



  if (!ready) {

    return (

      <div className="flex min-h-screen items-center justify-center px-6 text-center text-muted">

        Loading MentorMind AI...

      </div>

    );

  }



  return (

    <>

      <Suspense fallback={null}>

        <PresenterModeInitializer />

      </Suspense>

      {children}

    </>

  );

}

