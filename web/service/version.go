package service

import (
	//"fmt"
	"xray-ui/database"
	"xray-ui/database/model"
)

type GeoipVersion struct {


}
func (s *GeoipVersion) GetVersion() (*model.VersionStatus, error) {
	db := database.GetDB()

	version := &model.VersionStatus{}
	err := db.Model(model.VersionStatus{}).
		First(version).
		Error
	if err != nil {
		return nil, err
	}
	// fmt.Println(version)
	return version, nil
}
func (s *GeoipVersion) UpVersion( version string) error {
	db := database.GetDB()
	return db.Model(model.VersionStatus{}).
		Where("id = 1", ).
		Update("version", version).
		Error
}