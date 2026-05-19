import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIngredient } from "@/lib/api/ingredients";
import { getErrorMessage } from "@/lib/utils";

export function useCreateIngredient(onSuccess?: () => void, onError?: (error: string) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createIngredient,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
			onSuccess?.();
		},
		onError: (error) => {
			const errorMessage = getErrorMessage(error);
			onError?.(errorMessage);
		},
	});
}
