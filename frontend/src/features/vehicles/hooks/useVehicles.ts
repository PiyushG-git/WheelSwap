import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import {
  fetchSearchVehicles,
  fetchMyVehiclesList,
  fetchVehicleById,
  createNewVehicle,
  updateVehicleDetails,
  deleteVehicle,
  clearVehicleError,
  clearCurrentVehicle,
} from '../state/vehicleSlice';
import { vehiclesApi } from '../api';

export function useVehicles() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, meta, currentVehicle, myVehicles, loading, error } = useSelector(
    (state: RootState) => state.vehicles
  );

  const search = (params: Record<string, any>) => {
    dispatch(fetchSearchVehicles(params));
  };

  const getMyVehicles = () => {
    dispatch(fetchMyVehiclesList());
  };

  const getById = (id: string) => {
    dispatch(fetchVehicleById(id));
  };

  const create = async (data: any) => {
    return dispatch(createNewVehicle(data)).unwrap();
  };

  const update = async (id: string, data: any) => {
    return dispatch(updateVehicleDetails({ id, data })).unwrap();
  };

  const remove = async (id: string) => {
    return dispatch(deleteVehicle(id)).unwrap();
  };

  const uploadImages = async (id: string, files: FileList) => {
    const response = await vehiclesApi.uploadImages(id, files);
    if (currentVehicle?.id === id) {
      dispatch(fetchVehicleById(id));
    }
    return response.data;
  };

  const removeImage = async (id: string, imageId: string) => {
    await vehiclesApi.deleteImage(id, imageId);
    if (currentVehicle?.id === id) {
      dispatch(fetchVehicleById(id));
    }
  };

  const setPrimary = async (id: string, imageId: string) => {
    await vehiclesApi.setPrimaryImage(id, imageId);
    if (currentVehicle?.id === id) {
      dispatch(fetchVehicleById(id));
    }
  };

  const setBlockedDates = async (id: string, data: any) => {
    const response = await vehiclesApi.setAvailability(id, data);
    if (currentVehicle?.id === id) {
      dispatch(fetchVehicleById(id));
    }
    return response.data;
  };

  const resetError = () => {
    dispatch(clearVehicleError());
  };

  const resetCurrentVehicle = () => {
    dispatch(clearCurrentVehicle());
  };

  return {
    list,
    meta,
    currentVehicle,
    myVehicles,
    loading,
    error,
    search,
    getMyVehicles,
    getById,
    create,
    update,
    remove,
    uploadImages,
    removeImage,
    setPrimary,
    setBlockedDates,
    resetError,
    resetCurrentVehicle,
  };
}
