import { useEffect } from "react";

export const useResetPagination = function ( //on update to p.targetFocus update p.config.targetSecurity

    targetSecurity: string,
    setPagination: Function

) {
    useEffect(() => {
        setPagination(0)
    }, [targetSecurity, setPagination])
}
