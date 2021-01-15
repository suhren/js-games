<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.4" tiledversion="1.4.3" name="MyTileset" tilewidth="16" tileheight="16" tilecount="6" columns="0">
 <editorsettings>
  <export target="../MyTileset.json" format="json"/>
 </editorsettings>
 <grid orientation="orthogonal" width="1" height="1"/>
 <tile id="0">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="../assets/images/Checkpoint.png"/>
 </tile>
 <tile id="1">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="../assets/images/Floor1.png"/>
 </tile>
 <tile id="2">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="../assets/images/Goal.png"/>
 </tile>
 <tile id="3">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="0.01"/>
  </properties>
  <image width="16" height="16" source="../assets/images/ice.png"/>
 </tile>
 <tile id="4">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="../assets/images/Start.png"/>
 </tile>
 <tile id="5">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="../assets/images/Wall2.png"/>
 </tile>
 <wangsets>
  <wangset name="New Wang Set" tile="-1"/>
 </wangsets>
</tileset>
