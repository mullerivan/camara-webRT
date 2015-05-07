class CreateVideos < ActiveRecord::Migration
  def change
    create_table :videos do |t|
      t.string :name
      t.text :description
      t.references :project, index: true, foreign_key: true
      t.string :file
      t.decimal :meters

      t.timestamps null: false
    end
  end
end
